import * as error from '../error';
import {PIPELINE_STATUS} from '../constants';

import {Stream, Readable, Transform, Writable, PassThrough} from 'node:stream';
import {EventEmitter} from 'events';

interface IForkedStream {
  forkName: string;
  pipelineStatus: PIPELINE_STATUS;
  streams: (Writable | Transform)[];
  streamStatus: PIPELINE_STATUS[];
  runningPipeline?: Writable;
}

export class ForkingStream extends EventEmitter {
  private startedField: boolean;
  private doneField: boolean;
  private erroredField: boolean;
  private statusField: PIPELINE_STATUS;
  private unsafeField: boolean;

  private baseStreams: (Readable | Writable)[];
  private start: Readable;
  private forks: IForkedStream[];
  private streamStatus: PIPELINE_STATUS[];
  private baseStream?: Stream;

  get unsafe(): boolean {
    return this.unsafeField;
  }

  protected set unsafe(value: boolean) {
    this.unsafeField = value;
  }
  get started(): boolean {
    return this.startedField;
  }

  get completed(): boolean {
    return this.doneField;
  }

  get errored(): boolean {
    return this.erroredField;
  }

  get status(): PIPELINE_STATUS {
    return this.statusField;
  }

  protected set status(status: PIPELINE_STATUS) {
    if (status === PIPELINE_STATUS.RUNNING) this.startedField = true;
    else if (status === PIPELINE_STATUS.COMPLETE) this.doneField = true;
    else if (status === PIPELINE_STATUS.ERROR) this.erroredField = true;
    if (status !== PIPELINE_STATUS.NOT_STARTED) this.unsafe = true;
    this.statusField = status;
  }

  get isSafe(): boolean {
    if (this.unsafe) {
      throw new error.InvalidOperationError(
        'You cannot alter a pipeline that has already been started or someone has called done()',
        {PIPELINE_STATUS}
      );
    }
    return true;
  }

  constructor(start: Readable, ...transformers: (Writable | Transform)[]) {
    super();
    this.startedField = false;
    this.doneField = false;
    this.erroredField = false;
    this.unsafeField = false;
    this.statusField = PIPELINE_STATUS.NOT_STARTED;
    this.forks = [];
    this.baseStreams = [];
    this.streamStatus = [];
    this.start = start;
    this.start.pause();

    this.baseStreams.push(start);
    //this is only here so that we get credit from code coverage for covering out branches in the set status accessor
    this.status = PIPELINE_STATUS.NOT_STARTED;
    if (transformers.length) {
      this.addStreams(...transformers);
    }
    //lets hold on, on processing until everything is built
  }

  private finishBaseStream(index: number): void {
    this.streamStatus[index] = PIPELINE_STATUS.COMPLETE;
    if (this.forks.length === 0 && index === this.baseStreams.length - 1) {
      this.emit('finish');
    }
  }
  private errorBaseStream(index: number, err: Error) {
    this.streamStatus[index] = PIPELINE_STATUS.ERROR;
    this.emit('error', err);
  }

  private processBaseStreams() {
    let retval: Readable | Writable = null as unknown as Readable;
    this.baseStreams.forEach((baseStream, index) => {
      this.streamStatus.push(PIPELINE_STATUS.RUNNING);

      baseStream.on('finish', () => {
        this.finishBaseStream(index);
      });

      baseStream.on('error', err => {
        this.errorBaseStream(index, err);
      });
      if (index === 0) retval = baseStream as Readable;
      else retval = retval.pipe(baseStream as Transform);
    });
    return retval;
  }

  private finishForkStream(f: IForkedStream, index: number) {
    f.streamStatus[index] = PIPELINE_STATUS.COMPLETE;
    if (index === f.streamStatus.length - 1) this.emit('finish', f.forkName);
  }

  private errorForkStream(err: Error, f: IForkedStream, index: number) {
    f.streamStatus[index] = PIPELINE_STATUS.ERROR;
    for (let i = index; i < f.streamStatus.length; i++) {
      f.streamStatus[i] = PIPELINE_STATUS.CANCELLED;
    }
    f.pipelineStatus = PIPELINE_STATUS.ERROR;
    this.emit('error', err, f.forkName);
  }

  private processForks(baseStream: Readable) {
    this.forks.forEach(f => {
      const streams = f.streams;
      let forkStream: Writable | null = null;
      f.pipelineStatus = PIPELINE_STATUS.RUNNING;
      if (!streams.length) {
        this.addStreamsToFork(f.forkName, new PassThrough());
      }
      streams.forEach((s, index) => {
        f.streamStatus[index] = PIPELINE_STATUS.RUNNING;
        s.on('finish', () => {
          this.finishForkStream(f, index);
        });

        s.on('error', err => {
          this.errorForkStream(err, f, index);
        });

        if (!forkStream) forkStream = baseStream.pipe(s);
        else forkStream = forkStream.pipe(s);
      });

      //our condition is here because of typescript.  It will never hit but is penalizing us in code coverage.
      //istanbul ignore next line
      if (forkStream) f.runningPipeline = forkStream;
    });
  }

  //Once we are ready we can start taking in data.
  public startPipeline() {
    //is safe throws an exception if not safe so we need to ignore the else.
    //istanbul ignore else
    if (this.isSafe) {
      const baseStream: Readable = this.processBaseStreams();
      this.processForks(baseStream);
      this.start.resume();
      this.status = PIPELINE_STATUS.RUNNING;
    }
  }

  public addStreams(...transforms: (Writable | Transform)[]) {
    //is safe throws an exception if not safe so we need to ignore the else.
    //istanbul ignore else
    if (this.isSafe) {
      this.baseStreams.push(...transforms);
    }
  }

  public addStreamsToFork(name: string, ...streams: Writable[]) {
    //is safe throws an exception if not safe so we need to ignore the else.
    //istanbul ignore else
    if (this.isSafe) {
      const fork = this.forks.find(f => f.forkName === name);
      if (!fork) {
        throw new error.InvalidArgumentError(
          `An existing fork with the name: ${name} cannot be found`,
          'name',
          name
        );
      }

      fork.streams.push(...streams);
    }
  }

  public fork(
    name: string,
    ...streams: (Transform | Writable)[]
  ): IForkedStream {
    //is safe throws an exception if not safe so we need to ignore the else.
    //istanbul ignore else
    if (this.isSafe) {
      //Drop on a passthrough to create a fork.  All a passthrough
      //does is put its input on its output.  This allows us
      //to create a fork with no streams and makes the
      //TypeScript cleaner.
      //piping changes the stream state so we need to repause it.
      const forkedStream: IForkedStream = {
        forkName: name,
        pipelineStatus: PIPELINE_STATUS.NOT_STARTED,
        streams: [],
        streamStatus: [],
      };
      if (streams.length) forkedStream.streams.push(...streams);
      this.forks.push(forkedStream);
      return forkedStream;
    }
    //isSafe throws an exception so this will never get hit.  It is
    //just here to satisfy TypeScript
    //istanbul ignore next line
    return undefined as unknown as IForkedStream;
  }

  public done() {
    this.unsafe = true;
    return new Promise<void>((resolve, reject) => {
      this.on('finish', forkName => {
        if (forkName) {
          const forkStatus = this.forks.find(f => f.forkName === forkName);
          //this should never happen but is here to make typescript feel better
          //istanbul ignore else
          if (forkStatus) forkStatus.pipelineStatus = PIPELINE_STATUS.COMPLETE;
        }

        const stillRunning = this.forks.find(
          s => s.pipelineStatus === PIPELINE_STATUS.RUNNING
        );
        if (!stillRunning) {
          this.status = PIPELINE_STATUS.COMPLETE;
          resolve();
        }
      });

      this.on('error', (err, forkName) => {
        const wrappedError = new error.InvalidOperationError(
          `An unexpected error occurred while processing ${
            forkName ? `the fork : ${forkName}` : 'one of the base streams'
          }.  All forks were stopped as a result of this error.  See the inner error for additional information`,
          {forkName: forkName, error: err},
          err
        );
        this.status = PIPELINE_STATUS.ERROR;
        const stillRunning = this.forks.filter(
          s => s.pipelineStatus === PIPELINE_STATUS.RUNNING
        );
        //istanbul ignore next
        if (stillRunning.length) {
          stillRunning.forEach(r => {
            r.pipelineStatus = PIPELINE_STATUS.CANCELLED;
            r.streamStatus.forEach((s, index) => {
              if (s === PIPELINE_STATUS.RUNNING) {
                r.streamStatus[index] = PIPELINE_STATUS.CANCELLED;
              }
            });
          });
        }
        reject(wrappedError);
      });
    });
  }
}
