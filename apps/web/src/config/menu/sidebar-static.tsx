import {CreditCardIcon, UserCircleIcon} from '@heroicons/react/outline';

const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Billing',
        path: `/account/billing`,
        altIcon: <CreditCardIcon />,
      },
      {
        name: 'Settings',
        path: `/account/settings`,
        altIcon: <UserCircleIcon />,
      },
    ],
  },
];

export default sidebarMenu;
