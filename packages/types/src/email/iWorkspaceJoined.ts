import {EmailTypes} from './emailTypes';

export interface iWorkspaceJoinedData {
  type: EmailTypes.WORKSPACE_JOINED;
  userName: string;
  workspaceName: string;
  workspaceCode: string;
  workspaceId: string;
  email: string;
}
