import {DocumentType} from 'collab/types';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
import {NextResponse} from 'next/server';
/**
 * GET Documents
 *
 * Get a list of documents.
 * Filter by sending userId, projectIds, or metadata in the query, otherwise return all.
 * Only allow if authorized with NextAuth and user has access to each room.
 *
 * @param req
 * @param [req.query.userId] - Optional, filter to rooms with this userAccess set
 * @param [req.query.projectIds] - Optional, filter to rooms with these projectIds set (comma separated)
 * @param [req.query.documentType] - Optional, filter for this type of document e.g. "canvas"
 * @param [req.query.drafts] - Optional, retrieve only draft documents
 * @param [req.query.limit] - Optional, the amount of documents to retrieve
 * @param res
 */
export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const userId = searchParams.get('userId') ?? undefined;
  const projectIds = searchParams.get('projectIds') ?? undefined;
  const documentType = (searchParams.get('documentType') as DocumentType) ?? undefined;
  const drafts = !!searchParams.get('drafts');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  const projectIdsArray = projectIds ? projectIds.split(',') : [];

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.getDocuments({
    userId: userId,
    projectIds: projectIdsArray,
    documentType: documentType,
    drafts: drafts,
    limit: limit,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
