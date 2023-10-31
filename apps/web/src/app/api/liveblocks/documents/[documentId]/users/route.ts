import {NextResponse} from 'next/server';
import {RemoveUserRequest, UpdateUserRequest} from 'collab/types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';

/**
 * GET Users - Used in /lib/client/getDocumentUsers.ts
 *
 * Get all collaborators in a given document.
 * Only allow if authorized with NextAuth and user has access to room.
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param res
 */
export async function GET(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.getDocumentUsers({
    documentId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * POST Users - User in /lib/client/updateUserAccess.ts
 *
 * Add a new collaborator to a document, or edit an old collaborator
 * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.userId - The id of the user we're updating
 * @param req.body.access - The user's new document access level
 * @param res
 */
export async function POST(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {userId, access}: UpdateUserRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.updateUserAccess({
    documentId,
    userId,
    access,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * PATCH Users - Used in /lib/client/removeUserAccess.ts
 *
 * Remove a collaborator from a document
 * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.userId - The removed user's id
 * @param res
 */
export async function PATCH(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {userId}: RemoveUserRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.removeUserAccess({
    documentId,
    userId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
