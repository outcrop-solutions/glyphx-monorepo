import {CreateProject} from 'app/[workspaceSlug]/_components/controls/CreateProject';
import {GridToggle} from 'app/[workspaceSlug]/_components/controls/GridToggle';
import {OrientationToggle} from 'app/[workspaceSlug]/_components/controls/OrientationToggle';
import {SettingsDropdown} from 'app/[workspaceSlug]/_components/controls/SettingsDropdown';
import {ShareButton} from 'app/[workspaceSlug]/_components/controls/ShareButton';
import {ShowInfo} from 'app/[workspaceSlug]/_components/controls/ShowInfo';
import {ShowNotifications} from 'app/[workspaceSlug]/_components/controls/ShowNotifications';
import {CreateTemplateButton} from 'app/[workspaceSlug]/_components/controls/CreateTemplateButton';
import {AIButton} from 'app/[workspaceSlug]/_components/controls/AIButton';

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
