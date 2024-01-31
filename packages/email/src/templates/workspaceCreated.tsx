import * as React from 'react';
import {emailTypes} from 'types';
import '../styles.css';

export const WorkspaceCreatedTemplate: React.FC<Readonly<emailTypes.iWorkspaceCreatedData>> = ({
  workspaceName,
  workspaceCode,
  workspaceId,
}) => {
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/${workspaceId}/teams?code=${encodeURI(
    workspaceCode || ''
  )}`;
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
