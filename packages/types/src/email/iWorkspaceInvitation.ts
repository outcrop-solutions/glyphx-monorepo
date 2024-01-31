import {EmailTypes} from './emailTypes';

export interface iWorkspaceInvitationData {
  type: EmailTypes.WORKSPACE_INVITATION;
  workspaceName: string;
  workspaceId: string;
  inviteCode: string; // used to verify invite
  emails: string[];
}
