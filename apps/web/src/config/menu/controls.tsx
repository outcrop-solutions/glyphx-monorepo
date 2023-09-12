import {CreateProject} from 'app/[workspaceId]/_components/controls/CreateProject';
import {GridToggle} from 'app/[workspaceId]/_components/controls/GridToggle';
import {OrientationToggle} from 'app/[workspaceId]/_components/controls/OrientationToggle';
import {SettingsDropdown} from 'app/[workspaceId]/_components/controls/SettingsDropdown';
import {ShareButton} from 'app/[workspaceId]/_components/controls/ShareButton';
import {ShowInfo} from 'app/[workspaceId]/_components/controls/ShowInfo';
import {ShowNotifications} from 'app/[workspaceId]/_components/controls/ShowNotifications';
import {CreateTemplateButton} from 'app/[workspaceId]/_components/controls/CreateTemplateButton';
import {AIButton} from 'app/[workspaceId]/_components/controls/AIButton';

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
