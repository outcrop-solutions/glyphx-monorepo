import {NextResponse} from 'next/server';
import {UpdateDocumentScope} from 'types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
/**
 * POST Default access - used in /lib/client/updateDocumentScope.ts
 *
 * Update the default access for a document to public or private
 *
 * @param req
 * @param req.query.documentId - The document's id
 * @param req.body - JSON string, as defined below
 * @param req.body.access - The new default access: "public" or "private"
 * @param res
 */
export async function POST(req: Request, {params}: {params: {documentId: string}}) {
  const documentId = params.documentId;
  const {access}: UpdateDocumentScope = await req.json();

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.updateDefaultAccess({
    documentId,
    access,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
