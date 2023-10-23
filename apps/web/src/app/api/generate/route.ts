import {aiTypes} from 'types';
import {AiStreamManager} from 'core/src/streams/aiStreamManager';

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = 'edge';

export async function POST(req: Request): Promise<Response | undefined> {
  let {prompt} = await req.json();
  const ai = new AiStreamManager(aiTypes.AiStreamSourceType.OPENAI);

  const response = await ai.getResponse(prompt, aiTypes.OPENAI_MODELS.GPT_3);
  if (response) {
    return response;
  }
}
