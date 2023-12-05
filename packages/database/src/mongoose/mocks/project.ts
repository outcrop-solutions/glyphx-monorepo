// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IProjectDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_PROJECT = {
  id: 'id',
  name: 'name',
  description: 'description',
  sdtPath: 'sdtPath',
  workspace: {},
  lastOpened: 'lastOpened',
  imageHash: 'imageHash',
  aspectRatio: {},
  slug: 'slug',
  template: {},
  members: [],
  tags: [],
  currentVersion: 'currentVersion',
  state: {},
  states: [],
  files: {},
  filesystem: [],
  viewName: 'viewName',
} as unknown as IProjectDocument;
