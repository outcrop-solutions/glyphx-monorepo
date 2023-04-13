import { CogIcon, UserGroupIcon, ShieldExclamationIcon } from '@heroicons/react/outline';

const menu = (workspaceSlug) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace',
        path: `/account/${workspaceSlug}/settings/general`,
        altIcon: <CogIcon />,
      },
      {
        name: 'Team',
        path: `/account/${workspaceSlug}/settings/team`,
        altIcon: <UserGroupIcon />,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceSlug}/settings/advanced`,
        altIcon: <ShieldExclamationIcon />,
      },
    ],
  },
];

export default menu;
