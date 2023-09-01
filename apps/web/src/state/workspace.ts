import { atom } from 'recoil';
import { databaseTypes } from 'types';

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
    tags: [],
    states: [],
    creator: {} as unknown as databaseTypes.IUser,
    members: [] as unknown as databaseTypes.IMember[],
    projects: [] as unknown as databaseTypes.IProject[],
  },
});
