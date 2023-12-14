import {NextResponse} from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request): Promise<Response | undefined> {
  const env = process.env.GLYPHX_ENV || 'dev';

  if (env) {
    return NextResponse.json({env});
  }
}