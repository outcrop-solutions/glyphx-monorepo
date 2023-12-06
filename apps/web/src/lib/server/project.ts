import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {projectService, activityLogService} from 'business';
import {databaseTypes} from 'types';
import {formatUserAgent} from 'lib/utils';
/**
 * Create Default Project
 *
 * @note Creates a std default project
 * @route POST /api/project
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProject = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {name, workspaceId, description, docId} = req.body;
  try {
    const project = await projectService.createProject(
      name,
      workspaceId,
      session.user.id,
      session.user.email,
      undefined,
      description ?? '',
      docId
    );

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.id,
      resourceId: project?.id!,
      projectId: project.id,
      workspaceId: project.workspace.id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.RESOURCE_MODEL.PROJECT,
      action: databaseTypes.ACTION_TYPE.CREATED,
    });

    res.status(200).json({data: project});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Project
 *
 * @note returns a project by id
 * @route GET /api/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProject = async (req: NextApiRequest, res: NextApiResponse) => {
  const {projectId} = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const project = await projectService.getProject(projectId as string);
    res.status(200).json({data: {project}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Project
 *
 * @note returns a project by id
 * @route GET /api/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProjectState = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {projectId} = req.query;
  const {state} = req.body;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const project = await projectService.updateProjectState(projectId as string, state);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.id,
      resourceId: project?.id!,
      projectId: project.id,
      workspaceId: project.workspace.id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.RESOURCE_MODEL.PROJECT,
      action: databaseTypes.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({data: {project}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete Project
 *
 * @note  update project deletedAt date
 * @route DELETE /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProject = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {projectId} = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      const project = await projectService.deactivate(projectId as string);
      const {agentData, location} = formatUserAgent(req);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: project?.id!,
        workspaceId: project.workspace.id,
        projectId: project.id,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.ACTION_TYPE.DELETED,
      });
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
