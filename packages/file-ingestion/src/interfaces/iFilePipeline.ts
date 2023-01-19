import {IConstructableJoinProcessor} from './fileProcessing/iJoinProcessor';
import {IConstructableQueryPlanner} from './fileProcessing/iQueryPlanner';

/**
 *  Our pipelines are composable using dependency injection.
 *  This interface defines the public methods a client can call to
 *  interact with our pipeline.
 */
export interface IFilePipeline {
  /**
   * kicks off our pipeline
   */
  process(): void;
}

/**
 *  how our pipelines are constructed.
 */
export interface IConstructableFilePipeline {
  new (
    joinProcessor: IConstructableJoinProcessor,
    queryPlanner: IConstructableQueryPlanner
  ): IFilePipeline;
}

//TODO: need to give some thought as to how we might pass external parameters
//to the pipeline stages.
