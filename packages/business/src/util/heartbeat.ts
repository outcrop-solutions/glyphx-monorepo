import {processTrackingService} from '../services';
import {error} from 'core';
import {EventEmitter} from 'events';

export class Heartbeat extends EventEmitter {
  private readonly processIdField: string;
  private readonly intervalField: number;
  private internalStop: boolean;
  private timer?: NodeJS.Timeout;
  public get processId(): string {
    return this.processIdField;
  }

  public get interval(): number {
    return this.intervalField;
  }

  constructor(processId: string, interval = 60000 /*1 minute*/) {
    super();
    this.processIdField = processId;
    this.intervalField = interval;
    this.internalStop = false;
  }

  public async start() {
    //this could be a restart so we need to clear the internal stop flag
    this.internalStop = false;
    if (this.timer)
      throw new error.InvalidOperationError(
        'A timer has already been set.  You must call stop before you can call start again',
        {}
      );
    await this.ping();
    this.emit('started');
  }

  private async ping() {
    try {
      await processTrackingService.setHeartbeat(this.processId);
      this.emit('heartbeat');

      this.timer = setTimeout(this.ping.bind(this), this.interval);
    } catch (err) {
      this.internalStop = true;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = undefined;
      }
      if (err instanceof error.GlyphxError) this.emit('error', err);
      else
        this.emit(
          'error',
          new error.UnexpectedError(
            'An unexpected error occurred while updating the heartbeat and setting the new timer.  See the inner error for additional information',
            err
          )
        );
    }
  }

  public stop() {
    //we were already stopped internally
    if (!this.internalStop) {
      if (!this.timer)
        throw new error.InvalidOperationError('There is no timer set.  Call start before calling stop', {});
      clearTimeout(this.timer);
      this.timer = undefined;
      this.emit('stopped');
    }
  }
}
