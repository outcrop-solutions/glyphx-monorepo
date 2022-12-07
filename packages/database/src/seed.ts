import { prisma } from '.';

import type { User } from '@prisma/client';

const DEFAULT_USERS = [
  // Add your own user to pre-populate the database with
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
] as Array<Partial<User>>;

(async () => {
  try {
    await Promise.all(
      DEFAULT_USERS.map((user) =>
        prisma.user.upsert({
          where: {
            email: user.email!,
          },
          update: {
            ...user,
          },
          create: {
            ...user,
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
