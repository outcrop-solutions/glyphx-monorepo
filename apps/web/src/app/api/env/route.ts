import {NextResponse} from 'next/server';
export const runtime = 'nodejs';
import * as actions from 'actions';

export async function GET(req: Request): Promise<Response | undefined> {
  const env = process.env.GLYPHX_ENV || 'dev';
  let hello = await actions.hello();
  if (env) {
    return NextResponse.json({env, hello});
  }
}
