const menu = (workspaceId) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace Information',
        path: `/account/${workspaceId}/settings/general`,
      },
      {
        name: 'Team Management',
        path: `/account/${workspaceId}/settings/team`,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceId}/settings/advanced`,
      },
    ],
  },
];

export default menu;
