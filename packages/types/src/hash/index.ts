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
  hashPayload: (fileHash: string, payload: IHashPayload) => string;
}

export interface IHashPayload {
  projectId: string;
  files: IProject['files'];
  properties: IProject['state']['properties'];
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
  success: boolean;
}

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INCOMPLETE = 'INCOMPLETE',
}

export interface IStateReq {
  type: 'state';
  state: IState;
}

interface IValidParams {
  ok: true;
  workspaceId: string;
  projectId: string;
  stateId: string;
  payloadHash: string;
  fileHash: string;
  files: IProject['files'];
  properties: IProject['state']['properties'];
}

export type StateParams = IValidParams | {ok: false; stateId: string};

export interface IStateRetval {
  stateId: string;
  projectId: string;
  workspaceId: string;
  payloadHash: string;
  fileHash: string;
  files: IProject['files'];
  properties: IProject['state']['properties'];
  resolution: IResolution;
  integrity: {
    ok: boolean;
    version: string; // the version of the integrity check pass
  };
}
