'use server';
import {getServerSession} from 'next-auth';
import {projectService, activityLogService} from 'business';
import {databaseTypes} from 'types';
import {revalidatePath} from 'next/cache';
import {authOptions} from 'app/api/auth/[...nextauth]/route';

export const deleteProject = async (projectId: string) => {
  const session = await getServerSession(authOptions);

  const project = await projectService.deactivate(projectId as string);

  await activityLogService.createLog({
    actorId: session?.user?.id ?? '',
    resourceId: project?.id!,
    workspaceId: project?.workspace.id,
    projectId: project.id,
    location: 'serverAction',
    userAgent: {},
    onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
    action: databaseTypes.constants.ACTION_TYPE.DELETED,
  });

  revalidatePath('/[workspaceId]', 'page');
};
