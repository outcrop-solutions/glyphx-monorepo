import {useSession} from 'next-auth/react';
import {useRecoilValue} from 'recoil';
import {projectAtom, workspaceAtom} from 'state';

/**
 * Returns project permissions
 */
export const useProjectPermissions = () => {
  const session = useSession();
  const project = useRecoilValue(projectAtom);

  if (!project?.id) {
    return null;
  }

  const role = session?.data?.user.projectRoles[project.id];
  return role ?? null;
};

/**
 * Returns workspace permissions
 */
export const useWorkspacePermissions = () => {
  const session = useSession();
  const workspace = useRecoilValue(workspaceAtom);

  if (!workspace?.id) {
    return null;
  }

  const role = session?.data?.user.teamRoles[workspace.id];
  return role ?? null;
};
