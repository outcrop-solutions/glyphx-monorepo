import {CogIcon, UserGroupIcon, ShieldExclamationIcon} from '@heroicons/react/outline';

const menu = (workspaceId) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace',
        path: `/${workspaceId}/settings/general`,
        altIcon: <CogIcon />,
      },
      {
        name: 'Team',
        path: `/${workspaceId}/settings/team`,
        altIcon: <UserGroupIcon />,
      },
      {
        name: 'Advanced',
        path: `/${workspaceId}/settings/advanced`,
        altIcon: <ShieldExclamationIcon />,
      },
    ],
  },
];

export default menu;
