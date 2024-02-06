import {kv} from '@vercel/kv';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {Configuration, OpenAIApi} from 'openai-edge';
import {customAlphabet} from 'nanoid';
import {defaultMessages} from 'lib/utils/systemMessages';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const openai = new OpenAIApi(configuration);

export const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7); // 7-character random string

const projectCompletion = `Based on the data, shipper number 27 (DHL) is has the lowest average cost for shipping containers above size 35`;

export async function POST(req: Request) {
  const json = await req.json();
  const {messages, previewToken, projectId} = json;
  const intArr = new TextEncoder().encode(projectCompletion);

  if (projectId === process.env.PROJECT_ID) {
    // if (true) {
    // Split the encoded array into chunks
    const chunkSize = 4; // Adjust chunk size as needed
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < intArr.length; i += chunkSize) {
      const chunk = intArr.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    // Create a ReadableStream for streaming the chunks
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          // Enqueue Uint8Array chunks directly
          await new Promise((resolve) => setTimeout(resolve, 100)); // Delay in milliseconds
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    // Return the stream wrapped in StreamingTextResponse
    return new StreamingTextResponse(stream);
  } else {
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...defaultMessages, ...messages],
      temperature: 0.7,
      stream: true,
    });

    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        const title = json.messages[0].content.substring(0, 100);
        const id = json.id ?? nanoid();
        const createdAt = Date.now();
        const path = `/chat/${id}`;
        const payload = {
          id,
          title,
          // userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant',
            },
          ],
        };
        await kv.hmset(`chat:${id}`, payload);
      },
    });

    return new StreamingTextResponse(stream);
  }
}
