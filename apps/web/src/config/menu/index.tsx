import {CogIcon, UserGroupIcon, ShieldExclamationIcon} from '@heroicons/react/outline';

const menu = (workspaceId) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace',
        path: `/account/${workspaceId}/settings/general`,
        altIcon: <CogIcon />,
      },
      {
        name: 'Team',
        path: `/account/${workspaceId}/settings/team`,
        altIcon: <UserGroupIcon />,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceId}/settings/advanced`,
        altIcon: <ShieldExclamationIcon />,
      },
    ],
  },
];

export default menu;
