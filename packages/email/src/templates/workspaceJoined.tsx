import * as React from 'react';
import {emailTypes} from 'types';
import '../styles.css';

export const WorkspaceJoinedTemplate: React.FC<Readonly<emailTypes.iWorkspaceJoinedData>> = ({
  workspaceName,
  workspaceCode,
  workspaceId,
}) => {
  const link = `${process.env.APP_URL}/${workspaceId}/teams?code=${encodeURI(workspaceCode)}`;
  return (
    <div>
      <p>Hello there!</p>
      <p>
        Congrats on joining the <strong>{workspaceName}</strong> workspace.
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
