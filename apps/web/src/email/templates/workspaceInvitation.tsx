import React from 'react';
import {emailTypes} from 'types';

export const WorkspaceInvitationTemplate = ({
  workspaceName,
  inviteCode,
  workspaceId,
}: emailTypes.iWorkspaceInvitationData) => {
  const link = `${process.env.APP_URL}/${workspaceId}/teams?code=${encodeURI(inviteCode)}`;
  return (
    <div>
      <p>Hello there!</p>
      <p>
        You have been invited to join the <strong>{workspaceName}</strong> workspace.
      </p>
      <p>Workspaces encapsulate your projects activities with your dedicated teammates.</p>
      <p>
        Login into your account or you may open this link: <a href={link}>{workspaceName}</a>
      </p>
      <p>In case you need any assistance, just hit reply.</p>
      <p>
        Cheers,
        <br />
        The Glyphx Team
      </p>
    </div>
  );
};
