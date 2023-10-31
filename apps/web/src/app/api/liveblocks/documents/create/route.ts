import {NextResponse} from 'next/server';
import {CreateDocumentRequest} from 'types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';

/**
 * POST Create - Used in /lib/client/createDocument.ts
 *
 * Create a new Liveblocks room. Pass creation info in JSON body.
 * Only allow if authorized with NextAuth.
 *
 * @param req
 * @param req.body - JSON string, as defined below
 * @param req.body.name - The name of the new document
 * @param req.body.type - The type of document e.g. "canvas",
 * @param req.body.userId - The creator of the document
 * @param [req.body.projectIds] - Optional, limit access to room to just these groups
 * @param [req.body.draft] - Optional, if the document is a draft
 * @param res
 */
export async function POST(req: Request) {
  const {name, type, userId, projectIds, draft}: CreateDocumentRequest = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.createDocument({
    name: name,
    type: type,
    userId: userId,
    projectIds: projectIds ? projectIds.split(',') : undefined,
    draft: draft,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
