const menu = (workspaceSlug) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace Information',
        path: `/account/${workspaceSlug}/settings/general`,
      },
      {
        name: 'Team Management',
        path: `/account/${workspaceSlug}/settings/team`,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceSlug}/settings/advanced`,
      },
    ],
  },
];

export default menu;
