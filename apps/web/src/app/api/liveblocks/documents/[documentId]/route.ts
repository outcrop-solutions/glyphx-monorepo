import {NextResponse} from 'next/server';
import {UpdateDocumentRequest} from 'types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';

/**
 * GET Document - Used in /lib/client/getDocument.ts
 *
 * Get a document.
 * Only allow if user has access to room (including logged-out users and public rooms).
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param res
 */
export async function GET(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.getDocument({
    documentId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * POST Document - Used in /lib/client/updateDocumentName.ts
 *
 * Update a document with new data
 * Only allow if user has access to room (including logged-out users and public rooms).
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.documentData - Contains any properties to update, taken from a Document object
 * @param res
 */
export async function POST(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {documentData}: UpdateDocumentRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.updateDocument({
    documentId,
    documentData,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}

/**
 * DELETE Document - Used in /lib/client/deleteDocument.ts
 *
 * Delete a document
 * Only allow if authorized with NextAuth and is added as a userId on usersAccesses
 * Do not allow if public access, or access granted through projectIds
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param res
 */
export async function DELETE(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.deleteDocument({
    documentId,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
