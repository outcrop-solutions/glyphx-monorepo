'use server';
/**
 * Get or Create Default Workspace
 * redirect to first workspace or create default workspace and redirect
 */

import {Initializer, workspaceService} from 'business';
import {Route} from 'next';
import {Session} from 'next-auth';
import {redirect} from 'next/navigation';

export const getOrCreateWorkspace = async (session: Session): Promise<void> => {
  await Initializer.init();
  const workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email as string);
  if (workspaces) {
    redirect(`/${workspaces[0].id}` as Route);
  } else {
    const workspace = await workspaceService.createWorkspace(
      session?.user?.id,
      session?.user.email as string,
      'Default Workspace',
      'default-workspace'
    );
    if (workspace) {
      redirect(`/${workspace.id}` as Route);
    }
  }
};
