import SettingsIcon from 'public/svg/settings-icon.svg';
const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Billing',
        path: `/account/billing`,
        altIcon: '',
      },
      {
        name: 'Settings',
        path: `/account/settings`,
        altIcon: <SettingsIcon />,
      },
    ],
  },
];

export default sidebarMenu;
