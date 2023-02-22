import slugify from 'slugify';
import {
  ISendMail,
  sendMail,
  workspaceCreateHtml,
  workspaceCreateText,
  inviteHtml,
  inviteText,
} from '@glyphx/email';
import {database, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {v4} from 'uuid';

//eslint-disable-next-line
const prisma: any = {};
export async function countWorkspaces(slug) {
  return await prisma.workspace.count({
    where: {slug: {startsWith: slug}},
  });
}

export async function createWorkspace(creatorId, email, name, slug) {
  const count = await countWorkspaces(slug);

  if (count > 0) {
    slug = `${slug}-${count}`;
  }

  const workspace = await prisma.workspace.create({
    data: {
      creatorId,
      members: {
        create: {
          email,
          inviter: email,
          status: database.constants.INVITATION_STATUS.ACCEPTED,
          teamRole: database.constants.ROLE.OWNER,
        },
      },
      name,
      slug,
    },
  });
  await sendMail({
    html: workspaceCreateHtml({code: workspace.inviteCode, name}),
    subject: `[Glyphx] Workspace created: ${name}`,
    text: workspaceCreateText({code: workspace.inviteCode, name}),
    to: email,
  } as ISendMail);
}

export async function deleteWorkspace(id, email, slug) {
  const workspace = await getOwnWorkspace(id, email, slug);

  if (workspace) {
    await prisma.workspace.update({
      data: {deletedAt: new Date()},
      where: {id: workspace.id},
    });
    return slug;
  } else {
    throw new Error('Unable to find workspace');
  }
}

export async function getInvitation(inviteCode) {
  return await prisma.workspace.findFirst({
    select: {
      id: true,
      name: true,
      workspaceCode: true,
      slug: true,
    },
    where: {
      deletedAt: null,
      inviteCode,
    },
  });
}

export async function getOwnWorkspace(id, email, slug) {
  return await prisma.workspace.findFirst({
    select: {
      id: true,
      inviteCode: true,
      name: true,
    },
    where: {
      OR: [
        {id},
        {
          members: {
            some: {
              deletedAt: null,
              teamRole: database.constants.ROLE.OWNER,
              email,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });
}

export async function getSiteWorkspace(slug) {
  return await prisma.workspace.findFirst({
    select: {
      id: true,
      name: true,
      slug: true,
      // domains: { select: { name: true } },
    },
    where: {
      OR: [{slug}],
      AND: {deletedAt: null},
    },
  });
}

export async function getWorkspace(id, email, slug) {
  return await prisma.workspace.findFirst({
    select: {
      creatorId: true,
      name: true,
      inviteCode: true,
      slug: true,
      workspaceCode: true,
      creator: {select: {email: true}},
      members: {
        select: {
          email: true,
          teamRole: true,
        },
      },
    },
    where: {
      OR: [
        {id},
        {
          members: {
            some: {
              email,
              deletedAt: null,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });
}

export async function getWorkspaces(id, email) {
  return await prisma.workspace.findMany({
    select: {
      createdAt: true,
      creator: {
        select: {
          email: true,
          name: true,
        },
      },
      inviteCode: true,
      members: {
        select: {
          member: {
            select: {
              email: true,
              image: true,
              name: true,
            },
          },
          joinedAt: true,
          status: true,
          teamRole: true,
        },
      },
      name: true,
      slug: true,
      workspaceCode: true,
    },
    where: {
      OR: [
        {id},
        {
          members: {
            some: {
              email,
              deletedAt: null,
              status: database.constants.INVITATION_STATUS.ACCEPTED,
            },
          },
        },
      ],
      AND: {deletedAt: null},
    },
  });
}

export async function getWorkspacePaths() {
  const workspaces = await prisma.workspace.findMany({
    select: {slug: true},
    where: {deletedAt: null},
  });

  return [
    ...workspaces.map(workspace => ({
      params: {site: workspace.slug},
    })),
  ];
}

export async function inviteUsers(id, email, members, slug) {
  const workspace = await getOwnWorkspace(id, email, slug);
  const inviter = email;

  if (workspace) {
    const membersList = members.map(({email, role}) => ({
      email,
      inviter,
      teamRole: role,
    }));
    const data = members.map(({email}) => ({
      createdAt: null,
      email,
    }));
    await Promise.all([
      prisma.user.createMany({
        data,
        // skipDuplicates: true,
      }),
      prisma.workspace.update({
        data: {
          members: {
            createMany: {
              data: membersList,
              // skipDuplicates: true,
            },
          },
        },
        where: {id: workspace.id},
      }),
      sendMail({
        html: inviteHtml({code: workspace.inviteCode, name: workspace.name}),
        subject: `[Glyphx] You have been invited to join ${workspace.name} workspace`,
        text: inviteText({code: workspace.inviteCode, name: workspace.name}),
        to: members.map(member => member.email),
      }),
    ]);
    return membersList;
  } else {
    throw new Error('Unable to find workspace');
  }
}

export async function isWorkspaceCreator(id, creatorId) {
  return id === creatorId;
}

export async function isWorkspaceOwner(email, workspace) {
  let isTeamOwner = false;
  const member = workspace.members.find(
    member =>
      member.email === email &&
      member.teamRole === database.constants.ROLE.OWNER
  );

  if (member) {
    isTeamOwner = true;
  }

  return isTeamOwner;
}

export async function joinWorkspace(workspaceCode, email: string) {
  const workspace = await prisma.workspace.findFirst({
    select: {
      creatorId: true,
      id: true,
    },
    where: {
      deletedAt: null,
      workspaceCode,
    },
  });

  if (workspace) {
    await prisma.member.upsert({
      create: {
        workspaceId: workspace.id,
        email,
        inviter: workspace.creatorId,
        status: database.constants.INVITATION_STATUS.ACCEPTED,
      },
      update: {},
      where: {email},
    });
    return new Date();
  } else {
    throw new Error('Unable to find workspace');
  }
}

export async function updateWorkspaceName(id, email, name, slug) {
  const workspace = await getOwnWorkspace(id, email, slug);

  if (workspace) {
    await prisma.workspace.update({
      data: {name},
      where: {id: workspace.id},
    });
    return name;
  } else {
    throw new Error('Unable to find workspace');
  }
}

export async function updateSlug(id, email, newSlug, pathSlug) {
  let slug = slugify(newSlug.toLowerCase());
  const count = await countWorkspaces(slug);

  if (count > 0) {
    slug = `${slug}-${count}`;
  }

  const workspace = await getOwnWorkspace(id, email, pathSlug);

  if (workspace) {
    await prisma.workspace.update({
      data: {slug},
      where: {id: workspace.id},
    });
    return slug;
  } else {
    throw new Error('Unable to find workspace');
  }
}

export class WorkspaceService {
  public static async countWorkspaces(slug: string): Promise<number> {
    // TODO: return count by filter
    // @jp: we need a clean way to get the count by filter?
    console.log({slug});
    return Promise.resolve(4);
  }

  public static async createWorkspaces(
    creatorId: mongooseTypes.ObjectId | string,
    email: string,
    name: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const count = await WorkspaceService.countWorkspaces(slug);
      if (count > 0) {
        slug = `${slug}-${count}`;
      }
      // TODO: add member record to workspace
      // @jp: do we have a clean way to create related records in one operation - in this case a member record for the workspace
      const input = {
        workspaceCode: v4().replaceAll('-', ''),
        inviteCode: v4().replaceAll('-', ''),
        creatorId,
        name,
        slug,
      } as unknown as Omit<databaseTypes.IWorkspace, '_id'>;
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.createWorkspace(input);

      await sendMail({
        html: workspaceCreateHtml({code: workspace.inviteCode, name}),
        subject: `[Glyphx] Workspace created: ${name}`,
        text: workspaceCreateText({code: workspace.inviteCode, name}),
        to: email,
      } as ISendMail);

      return workspace;
    } catch (err) {
      const e = new error.DataServiceError(
        'An unexpected error occurred while creating the workspace. See the inner error for additional details',
        'workspace',
        'createWorkspace',
        {creatorId, name, slug},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }

  /**
   *
   * This is used as a utility function in order to get the default user workspace
   * @param userId
   * @param email
   * @param slug
   * @returns Promise<databaseTypes.IWorkspace | null>
   */

  static async getOwnWorkspace(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    // TODO: add filter to get workspaces where user is a member
    // @jp: we need a clean way to implement filter on related records here
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.getWorkspaces({
          deletedAt: null,
          slug,
        });

      if (Array.isArray(workspaces)) {
        const filteredWorkspaces = workspaces.filter(space =>
          space.members.filter(
            mem =>
              mem.id === id ||
              (mem.email === email &&
                mem.teamRole === databaseTypes.constants.ROLE.OWNER &&
                mem.deletedAt === null)
          )
        );
        if (filteredWorkspaces.length > 0) {
          return filteredWorkspaces[0];
        } else return null;
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the Workspace. See the inner error for additional details',
          'workspace',
          'getWorkspace',
          {email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteWorkspace(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    slug: string
  ): Promise<string | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        slug
      );

      if (workspace) {
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          deletedAt: new Date(),
        });
        return slug;
      } else {
        return null;
      }
    } catch (err) {
      const e = new error.DataServiceError(
        'An unexpected error occurred while updating the member. See the inner error for additional details',
        'member',
        'updateMember',
        {userId, email, slug},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }

  public static async getInvitation(
    inviteCode: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.getWorkspaces({
          inviteCode,
        });
      return workspace;
    } catch (err) {
      const e = new error.DataServiceError(
        'An unexpected error occurred while updating the member. See the inner error for additional details',
        'member',
        'updateMember',
        {inviteCode},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }
}
