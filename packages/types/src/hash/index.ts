import {IProject, IState} from '../database';
import {IFileStats} from '../fileIngestion';

export interface IHashStrategy {
  // Must be globally unique to each instance of HashResolver
  version: string;
  /**
   * Performs project.files (fileSystem) hashing operation
   * Changes if fileStat.fileName | column.name | column.fieldType changes
   * Checks project.files against project.files
   * called within hashPayload(hashFiles(), project)
   * used within isFilterWritableSelector by it's lonesome to check against IState.fileSystemHash
   * @param files
   * @returns
   */
  hashFiles: (files: IFileStats[]) => string;
  /**
   * Performs payload hashing operation
   * This is used to:
   * - download the models in ModelFooter.tsx via the correct data file urls
   * - create or download model in handleApply in Properties.tsx
   * - create or download model in useProject.tsx if not currently loaded (this doesn't look right)
   * - doesStateExistsSelector (determines if state exists in the current recoil project atom, via state.payloadHash comparison)
   * @param fileHash
   * @param project
   * @returns
   */
  hashPayload: (fileHash: string, project: IProject) => string;
}

export interface IDataPresence {
  exists: boolean;
  path: string;
}

export interface IResolution {
  presence: IDataPresence[];
  version: string;
  fileHash: string;
  payloadHash: string;
}

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INCOMPLETE = 'INCOMPLETE',
}
export interface IProjectReq {
  type: 'project';
  project: IProject;
}
export interface IStateReq {
  type: 'state';
  state: IState;
}
export type ResolveReq = IProjectReq | IStateReq;
