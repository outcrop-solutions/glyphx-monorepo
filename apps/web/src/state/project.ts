import { atom, selector } from 'recoil';
import { database as databaseTypes } from '@glyphx/types';
import { workspaceAtom } from './workspace';

export const projectAtom = atom<databaseTypes.IProject | null>({
  key: 'projectAtom',
  default: null,
});

// extracts Qt payload for opening a project from currently selected project
export const payloadSelector = selector({
  key: 'payload',
  get: ({ get }) => {
    const selectedProject = get(projectAtom);
    const selectedWorkspace = get(workspaceAtom);
    if (!selectedProject) return { url: null, sdt: null };
    return { url: selectedProject.url, sdt: selectedProject.filePath };
  },
});