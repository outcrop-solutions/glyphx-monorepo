import {iEmailUpdatedData} from './iEmailUpdated';
import {iEmailVerificationData} from './iEmailVerification';
import {iStateCreatedData} from './iStateCreated';
import {iWorkspaceCreatedData} from './iWorkspaceCreated';
import {iWorkspaceInvitationData} from './iWorkspaceInvitation';
import {iWorkspaceJoinedData} from './iWorkspaceJoined';

export type EmailData =
  | iEmailUpdatedData
  | iEmailVerificationData
  | iStateCreatedData
  | iWorkspaceCreatedData
  | iWorkspaceInvitationData
  | iWorkspaceJoinedData;
