import { CreateProject } from 'partials/layout/controls/CreateProject';
import { GridToggle } from 'partials/layout/controls/GridToggle';
import { OrientationToggle } from 'partials/layout/controls/OrientationToggle';
import { SettingsDropdown } from 'partials/layout/controls/SettingsDropdown';
import { ShareButton } from 'partials/layout/controls/ShareButton';
import { CreateTemplateButton } from 'partials/layout/controls/CreateTemplateButton';
import { AIButton } from 'partials/layout/controls/AIButton';
import { ShowInfo } from 'partials/layout/controls/ShowInfo';
import { ShowNotifications } from 'partials/layout/controls/ShowNotifications';

export const projectControls = () => [
  {
    component: () => <AIButton />,
  },
  {
    component: () => <CreateTemplateButton />,
  },
  {
    component: () => <ShareButton />,
  },
  {
    component: () => <OrientationToggle />,
  },
  {
    component: () => <ShowInfo />,
  },
  // {
  //   component: () => <ShowNotifications />,
  // },
  {
    component: () => <SettingsDropdown />,
  },
];

export const workspaceControls = () => [
  {
    component: () => <CreateProject />,
  },
  {
    component: () => <GridToggle />,
  },
  // {
  //   component: () => <ShowNotifications />,
  // },
  {
    component: () => <SettingsDropdown />,
  },
];

export const homeControls = () => [
  {
    component: () => <ShowNotifications />,
  },
  {
    component: () => <SettingsDropdown />,
  },
];
