// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IWorkspaceDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_WORKSPACE = {
  workspaceCode: 'workspaceCode',
  inviteCode: 'inviteCode',
  name: 'name',
  slug: 'slug',
  tags: [],
  description: 'description',
  creator: {},
  members: [],
  projects: [],
  states: [],
} as unknown as IWorkspaceDocument;