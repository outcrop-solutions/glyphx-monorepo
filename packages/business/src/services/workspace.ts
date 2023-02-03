// @ts-nocheck
// eslint-disable-next-line node/no-extraneous-import
import {InvitationStatus, Role} from '@prisma/client';
import slugify from 'slugify';

import {html as createHtml, text as createText} from 'email/workspaceCreate';
import {html as inviteHtml, text as inviteText} from 'email/invitation';
import {ISendMail, sendMail} from 'lib/server/mail';
import {prisma} from '@glyphx/database';

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
          status: InvitationStatus.ACCEPTED,
          teamRole: Role.OWNER,
        },
      },
      name,
      slug,
    },
  });
  await sendMail({
    html: createHtml({code: workspace.inviteCode, name}),
    subject: `[Glyphx] Workspace created: ${name}`,
    text: createText({code: workspace.inviteCode, name}),
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
              teamRole: Role.OWNER,
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
              status: InvitationStatus.ACCEPTED,
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
    member => member.email === email && member.teamRole === Role.OWNER
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
        status: InvitationStatus.ACCEPTED,
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
