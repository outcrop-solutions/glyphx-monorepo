import {Liveblocks} from '@liveblocks/node';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {getDraftsGroupName} from 'collab/lib/server';
import {SECRET_API_KEY} from 'liveblocks.server.config';
import {getServerSession} from 'next-auth';
import {NextResponse} from 'next/server';

const liveblocks = new Liveblocks({
  secret: SECRET_API_KEY as string,
});

/**
 * AUTH - Used in /liveblocks.config.ts
 *
 * Authorize your Liveblocks session with ID tokens. Get info about the current
 * user from NextAuth, pass it to Liveblocks, and connect to the room.
 *
 * @param req
 * @param req.body.roomId - The id of the current room
 * @param res
 */
export async function POST(req: Request) {
  // Get current session from NextAuth

  const nextAuthSession = await getServerSession(authOptions);

  if (nextAuthSession) {
    const {id, projectIds} = nextAuthSession.user;

    const projectIdsWithDraftsGroup = [...(projectIds ?? []), getDraftsGroupName(id)];

    // Get Liveblocks ID token
    const {status, body} = await liveblocks.identifyUser({
      userId: id,
      groupIds: projectIdsWithDraftsGroup,
    });

    const res = JSON.parse(body);

    return NextResponse.json(res);
  } else {
    return NextResponse.json({error: 'forbidden', reason: '...'});
  }
}
