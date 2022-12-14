import * as error from '../error';
import {PIPELINE_STATUS} from '../constants';

import {Stream, Readable, Transform, Writable, PassThrough} from 'node:stream';
import {EventEmitter} from 'events';

abstract class SafeStream extends EventEmitter {
  private startedField: boolean;
  private doneField: boolean;
  private erroredField: boolean;
  private statusField: PIPELINE_STATUS;
  private unsafeField: boolean;

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

    this.statusField = status;
  }

  get isSafe(): boolean {
    if (this.status !== PIPELINE_STATUS.NOT_STARTED && this.unsafe) {
      throw new error.InvalidOperationError(
        'You cannot alter a pipeline that has already been started or someone has called done()',
        {PIPELINE_STATUS}
      );
    }
    return true;
  }

  constructor() {
    super();
    this.startedField = false;
    this.doneField = false;
    this.erroredField = false;
    this.unsafeField = false;
    this.statusField = PIPELINE_STATUS.NOT_STARTED;
  }
}
export class ForkingStream extends SafeStream {
  private basePipe: Stream;
  private start: Readable;
  private forks: ForkedStream[];
  private tasks: Promise<void>[];

  get isSafe(): boolean {
    if (this.status !== PIPELINE_STATUS.NOT_STARTED) {
      throw new error.InvalidOperationError(
        'You cannot alter a pipeline that has already been started',
        {PIPELINE_STATUS}
      );
    }
    return true;
  }
  constructor(start: Readable, ...transformers: Transform[]) {
    super();
    this.forks = [];
    this.tasks = [];

    this.start = start;
    this.basePipe = start;
    if (transformers.length) {
      transformers.forEach(transform => {
        this.addStreams(transform);
      });
    }
    //lets hold on, on processing until everything is built
    this.start.pause();
  }

  //Once we are ready we can start taking in data.
  public startPipeline() {
    if (this.isSafe && this.start.isPaused()) {
      this.forks.forEach(f => f.start());
      this.start.resume();
      this.status = PIPELINE_STATUS.RUNNING;
    }
  }
  public addStreams(...transforms: Writable[]) {
    if (this.isSafe) {
      transforms.forEach(transform => {
        this.basePipe = this.basePipe.pipe(transform);
      });
    }
  }

  public addStreamsToFork(name: string, ...streams: Writable[]) {
    if (this.isSafe) {
      const fork = this.forks.find(f => f.name === name);
      if (!fork) {
        throw new error.InvalidArgumentError(
          `An existing fork with the name: ${name} cannot be found`,
          'name',
          name
        );
      }

      fork.addStreams(...streams);
    }
  }

  public fork(
    name: string,
    ...streams: (Transform | Writable)[]
  ): ForkedStream {
    //Drop on a passthrough to create a fork.  All a passthrough
    //does is put its input on its output.  This allows us
    //to create a fork with no streams and makes the
    //TypeScript cleaner.
    let fork: Writable = this.basePipe.pipe(
      new PassThrough({objectMode: true})
    );

    streams.forEach(stream => {
      fork = fork.pipe(stream);
    });
    const index = this.forks.length;
    const forkedStream = new ForkedStream(index, name, fork);
    this.forks.push(forkedStream);
    this.tasks.push(forkedStream.done());
    return forkedStream;
  }

  public async done() {
    this.unsafe = true;
    await Promise.all(this.tasks);
  }
}

class ForkedStream extends SafeStream {
  private forkField: Writable;
  private readonly indexField: number;
  private readonly nameField: string;
  public get stream(): Writable {
    return this.forkField;
  }

  public get index(): number {
    return this.indexField;
  }

  public get name(): string {
    return this.nameField;
  }
  constructor(index: number, name: string, fork: Writable) {
    super();
    this.forkField = fork;
    this.nameField = name;
    this.indexField = index;
  }

  public start(): void {
    this.status = PIPELINE_STATUS.RUNNING;
  }
  public addStreams(...streams: Writable[]) {
    if (this.isSafe) {
      streams.forEach(transform => {
        this.forkField = this.forkField.pipe(transform);
      });
    }
  }
  public done(): Promise<void> {
    this.unsafe = true;
    return new Promise((resolve, reject) => {
      this.forkField.on('finish', () => {
        this.status = PIPELINE_STATUS.COMPLETE;
        resolve();
      });
      this.forkField.on('error', err => {
        this.status = PIPELINE_STATUS.ERROR;
        reject(err);
      });
    });
  }
}
