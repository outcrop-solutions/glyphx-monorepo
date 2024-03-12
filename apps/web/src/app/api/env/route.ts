import {NextResponse} from 'next/server';
import fs from 'node:fs';

export const runtime = 'server';

export async function GET(req: Request): Promise<Response | undefined> {
  const params = await req.text();
  const env = process.env.GLYPHX_ENV || 'dev';
  const processDir = process.cwd();
  const files = fs.readdirSync(processDir);
  const queryFiles = params ? fs.readdirSync(params) : [];

  if (env) {
    return NextResponse.json({env, processDir, files, queryFiles});
  }
}
