const menu = (workspaceSlug) => [
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Workspace',
        path: `/account/${workspaceSlug}/settings/general`,
        altIcon: '',
      },
      {
        name: 'Team Management',
        path: `/account/${workspaceSlug}/settings/team`,
        altIcon: '',
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceSlug}/settings/advanced`,
        altIcon: '',
      },
    ],
  },
];

export default menu;
