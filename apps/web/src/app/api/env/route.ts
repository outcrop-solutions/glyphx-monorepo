import {NextResponse} from 'next/server';
import fs from 'node:fs';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response | undefined> {
  const params = await req.text();
  console.log('params', params);
  const env = process.env.GLYPHX_ENV || 'dev';
  const processDir = process.cwd();
  const files = fs.readdirSync(processDir);
  const queryFiles = params ? fs.readdirSync(processDir + '/' + params) : [];

  if (env) {
    return NextResponse.json({env, processDir, files, queryFiles});
  }
}
