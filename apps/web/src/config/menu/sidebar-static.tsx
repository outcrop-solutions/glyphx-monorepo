const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Billing',
        path: `/account/billing`,
      },
      {
        name: 'Payment',
        path: `/account/payment`,
      },
      {
        name: 'Settings',
        path: `/account/settings`,
      },
    ],
  },
];

export default sidebarMenu;
