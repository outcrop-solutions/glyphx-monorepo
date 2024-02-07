import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
import {NextResponse} from 'next/server';

/**
 * GET Next - used in /lib/client/getNextDocuments.ts
 *
 * Get the next rooms from the next param
 * The `next` param is retrieved from /pages/api/documents/index.ts
 * That API is called on the client within /lib/client/getDocumentsByGroup.ts
 * Only allow if authorized with NextAuth and user has access to each room.
 *
 * @param req
 * @param req.query.nextPage - String containing a URL to get the next set of rooms, returned from Liveblocks API
 * @param res
 */
export async function GET(req: Request, {params}: {params: {nextPage: string}}) {
  const nextPage = decodeURIComponent(params.nextPage);

  const serverDoc = new ServerDocumentManager();
  const {data, error} = await serverDoc.getNextDocuments({
    nextPage,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
