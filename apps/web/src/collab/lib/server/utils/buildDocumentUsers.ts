import {prisma} from 'database';
import {DocumentUser, Room} from '../../../types';
import {roomAccessesToDocumentAccess} from './convertAccessType';

/**
 * Convert a Liveblocks room result into a list of DocumentUsers
 *
 * @param result - Liveblocks getRoomById() result
 * @param userId - The current user's id
 */
export async function buildDocumentUsers(result: Room, userId: string) {
  const users: DocumentUser[] = [];

  for (const [id, accessValue] of Object.entries(result.usersAccesses)) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        projects: {
          select: {
            id: true,
          },
        },
      },
    });

    if (user) {
      users.push({
        ...user,
        name: user.name || 'James Graham',
        avatar: 'https://liveblocks.io/avatars/avatar-0.png',
        projectIds: user.projects.map((proj) => proj.id),
        access: roomAccessesToDocumentAccess(accessValue, true),
        color: '#FFFFFF',
        isCurrentUser: id === userId,
      });
    }
  }

  return users;
}
