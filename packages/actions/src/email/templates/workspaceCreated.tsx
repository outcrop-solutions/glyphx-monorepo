import React from 'react';
import {emailTypes} from 'types';

export const WorkspaceCreatedTemplate = ({
  workspaceName,
  workspaceCode,
  workspaceId,
}: emailTypes.iWorkspaceCreatedData) => {
  const link = `${process.env.APP_URL}/${workspaceId}/teams?code=${encodeURI(workspaceCode)}`;
  return (
    <div>
      <p>Hello there!</p>
      <p>
        You have created the <strong>{workspaceName}</strong> workspace.
      </p>
      <p>Workspaces encapsulate your projects activities with your dedicated teammates.</p>
      <p>
        Start inviting your teammates by sharing this link: <a href={link}>{link}</a>
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
