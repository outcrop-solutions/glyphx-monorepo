'use server';
import {DocumentGroup, Room} from 'types';
import {roomAccessesToDocumentAccess} from './convertAccessType';
import {projectService} from 'business';

/**
 * Convert a Liveblocks room result into a list of DocumentGroups
 *
 * @param result - Liveblocks getRoomById() result
 */
export async function buildProjects(result: Room) {
  const projects: DocumentGroup[] = [];

  for (const [id, accessValue] of Object.entries(result.groupsAccesses)) {
    const project = await projectService.getProject(id);

    if (project) {
      projects.push({
        id: project.id as string,
        name: project.name as string,
        access: roomAccessesToDocumentAccess(accessValue, false),
      });
    }
  }

  return projects;
}
