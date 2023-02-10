/*eslint-disable*/
import {prisma} from '.';

import type {Workspace, Project, User} from '@prisma/client';

const DEFAULT_ORGS = [
  {name: 'Robert Weed', description: 'Customer #1'},
  {
    name: 'Glyphx',
    description: 'Admin of software',
    members: [
      {
        name: 'Danny Hill',
        email: 'danny@synglyphx.com',
      },
      {
        name: 'Michael Wicks',
        email: 'mwicks@nd.edu',
      },
      {
        name: 'JP Burford',
        email: 'jpburford@gmail.com',
      },
      {
        name: 'Johnathan Lamptey',
        email: 'jlamptey@nd.edu',
      },
      {
        name: 'Bryan Holster',
        email: 'bryan@synglyphx.com',
      },
      {
        name: 'James Graham',
        email: 'jamesmurdockgraham@gmail.com',
      },
    ],
    projects: [
      {name: 'First Project', description: 'Project #1'},
      {name: 'Second Project', description: 'Project #2'},
    ],
  },
] as Array<Partial<Workspace>>;

(async () => {
  try {
    await Promise.all(
      DEFAULT_ORGS.map(org =>
        prisma.workspace.create({
          data: {
            ...org,
          },
        })
      )
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
