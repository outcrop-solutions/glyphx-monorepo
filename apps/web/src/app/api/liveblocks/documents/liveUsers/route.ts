import {NextResponse} from 'next/server';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
/**
 * POST Live Users - Used in /lib/client/getLiveUsers.ts
 *
 * Retrieve the current live users in rooms
 * Select rooms by posting an array of room names in the body
 * Only allow if authorized with NextAuth
 *
 * @param req
 * @param req.body - JSON string, as defined below
 * @param req.body.roomIds - A list of room ids to select
 * @param res
 */
export async function POST(req: Request) {
  const documentIds: string[] = await req.json();
  const doc = new ServerDocumentManager();
  const {data, error} = await doc.getLiveUsers({
    documentIds,
  });

  if (error) {
    return NextResponse.json({error});
  }

  return NextResponse.json(data);
}
