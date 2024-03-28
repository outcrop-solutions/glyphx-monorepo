import {NextResponse} from 'next/server';
import fs from 'node:fs';
export const runtime = 'nodejs';
import * as actions from 'actions';

export async function POST(req: Request): Promise<Response | undefined> {
  return NextResponse.json({hello: actions.hello()});
}
