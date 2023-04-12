import { SettingsDropdown } from 'partials/layout/controls/SettingsDropdown';
import { ShowInfo } from 'partials/layout/controls/ShowInfo';
import { ShowNotifications } from 'partials/layout/controls/ShowNotifications';

export const projectControls = () => [
  {
    component: () => <ShowInfo />,
  },
  {
    component: () => <ShowNotifications />,
  },
];

export const workspaceControls = () => [
  {
    component: () => <ShowInfo />,
  },
  {
    component: () => <ShowNotifications />,
  },
  {
    component: () => <SettingsDropdown />,
  },
];
