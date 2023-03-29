import { atom } from 'recoil';
import { database as databaseTypes } from '@glyphx/types';

export const workspaceAtom = atom<databaseTypes.IWorkspace>({
  key: 'workspaceAtom',
  default: {
    workspaceCode: '',
    inviteCode: '',
    name: '',
    slug: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
    description: '',
    creator: {} as unknown as databaseTypes.IUser,
    members: [],
    projects: [],
  },
});
