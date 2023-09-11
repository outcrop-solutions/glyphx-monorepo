// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IStateDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_STATE = {
  createdBy: {},
  name: 'name',
  version: 'version',
  static: 'static',
  imageHash: 'imageHash',
  camera: {},
  aspectRatio: {},
  properties: {},
  fileSystemHash: 'fileSystemHash',
  payloadHash: 'payloadHash',
  description: 'description',
  project: {},
  workspace: {},
  fileSystem: {},
} as unknown as IStateDocument;
