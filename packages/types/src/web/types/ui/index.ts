// determines what to show in right sidebar
export type RightSidebarControl =
  | boolean
  | 'notification'
  | 'info'
  | 'search'
  | 'share'
  | 'comments';

// determines what to show in the modal utility
export type ModalContent =
  | boolean
  | 'createProject'
  | 'createWorkspace'
  | 'deleteAccount'
  | 'deleteWorkspace'
  | 'deleteProject';

export type SplitPaneOrientation = 'vertical' | 'horizontal';
