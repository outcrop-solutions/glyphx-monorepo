import { prisma } from '@glyphx/database';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Project } from '@prisma/client';
import type { Session } from 'next-auth';

/**
 * Get Project
 *
 * Fetches & returns either a single or all projects available depending on
 * whether a `projectId` query parameter is provided. If not all projects are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getProject(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { projectId, orgId } = req.query;

  if (Array.isArray(projectId) || Array.isArray(orgId))
    return res.status(400).end('Bad request. Query parameters are not valid.');

  // @ts-ignore
  if (!session.user.id) return res.status(500).end('Server failed to get session user ID');

  try {
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
        },
        include: {
          type: true,
          owner: true,
          state: true,
        },
      });
      return res.status(200).json(project);
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: orgId,
      },
    });

    const projects = !organization
      ? []
      : await prisma.project.findMany({
          where: {
            orgId: orgId,
          },
          include: {
            type: true,
            state: true,
            owner: true,
          },
          orderBy: {
            updatedAt: 'asc',
          },
        });

    return res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Project
 *
 * Creates a new project from a provided `pageId` query parameter.
 *
 * Once created, the pages new `projectId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createProject(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { orgId } = req.query;
  const { name, description, sdtPath, slug, typeId, ownerId, stateId } = req.body;

  if (Array.isArray(orgId)) return res.status(400).end('Bad request. pageId parameter cannot be an array.');

  try {
    const response = await prisma.project.create({
      data: {
        name,
        description,
        sdtPath,
        slug,
      },
    });

    return res.status(201).json({
      projectId: response.id,
    });
    // } else {
    //   return res.status(500).end({ msg: "TPL is not connected to BCO" });
    // }
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Project
 *
 * Deletes a project from the database using a provided `projectId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deleteProject(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { projectId } = req.query;

  if (Array.isArray(projectId)) return res.status(400).end('Bad request. projectId parameter cannot be an array.');

  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Project
 *
 * Updates a project & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - name
 *  - incoterm
 *  - freight_type
 *  - estimated_departure_date
 *  - estimated_arrival_date
 *  - alert_profile
 *  - legs
 *  - bcoId
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateProject(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<Project>> {
  const { orgId } = req.query;

  if (Array.isArray(orgId)) return res.status(400).end('Bad request. projectId parameter cannot be an array.');

  const { id, name, description, sdtPath, slug, isTemplate } = req.body;

  try {
    const project = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        name,
        description,
        sdtPath,
        slug,
        isTemplate,
      },
    });

    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

export async function updateOwnership(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { orgId } = req.query;
  const { ownerId } = req.body;

  if (Array.isArray(orgId)) return res.status(400).end('Bad request. orgId parameter cannot be an array.');

  try {
    const response = await prisma.project.create({
      data: {
        owner: {
          connect: {
            id: ownerId,
          },
        },
      },
    });
    return res.status(201).json({
      projectId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
export async function updateState(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { orgId } = req.query;
  const { stateId } = req.body;

  if (Array.isArray(orgId)) return res.status(400).end('Bad request. orgId parameter cannot be an array.');

  try {
    const response = await prisma.project.create({
      data: {
        state: {
          connect: {
            id: stateId,
          },
        },
      },
    });
    return res.status(201).json({
      projectId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
export async function updateType(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { orgId } = req.query;
  const { typeId } = req.body;

  if (Array.isArray(orgId)) return res.status(400).end('Bad request. orgId parameter cannot be an array.');

  try {
    const response = await prisma.project.create({
      data: {
        type: {
          connect: {
            id: typeId,
          },
        },
      },
    });
    return res.status(201).json({
      projectId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
