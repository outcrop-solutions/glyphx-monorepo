// import {useSession} from 'next-auth/react';
// import {useRecoilValue} from 'recoil';
// import {projectAtom} from 'state';

// export const useProjectPermissions = () => {
//   const session = useSession();
//   const project = useRecoilValue(projectAtom);
//   const role = session?.data?.user.projectRoles[project.id];
//   return role ?? null;
// };

// export const useWorkspacePermissions = () => {
//   const session = useSession();
//   const workspace = useRecoilValue(workspaceAtom);
//   const role = session?.data?.user.teamRoles[workspace.id];
//   return role ?? null;
// };
