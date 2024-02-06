import {EmailTypes} from './emailTypes';

export interface iWorkspaceCreatedData {
  type: EmailTypes.WORKSPACE_CREATED;
  workspaceName: string;
  workspaceCode: string;
  workspaceId: string;
  email: string; // the user who created the workspace
}
