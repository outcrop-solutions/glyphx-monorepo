import {NextResponse} from 'next/server';
import {RemoveGroupRequest, UpdateGroupRequest} from 'collab/types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
/**
 * GET Groups - Used in /lib/client/getDocumentGroups.ts
 *
 * Get all groups attached to a given document.
 * Only allow if authorized with NextAuth and user has access to room.
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param res
 */
export async function GET(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.getDocumentGroups({
    documentId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * POST Groups - User in /lib/client/updateGroupAccess.ts
 *
 * Add a new group to a document, or edit an old group's permissions
 * Only allow if authorized with NextAuth and if user is added as a userId on usersAccesses
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.projectId - The edit group's id
 * @param req.body.access - The invited user's new document access
 * @param res
 */
export async function POST(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {projectId, access}: UpdateGroupRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.updateGroupAccess({
    documentId,
    projectId,
    access,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * PATCH Groups - Used in /lib/client/removeGroupAccess.ts
 *
 * Remove a group from a document
 * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.projectId - The removed group's id
 * @param res
 */
export async function PATCH(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {projectId}: RemoveGroupRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.removeGroupAccess({
    documentId,
    projectId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
