import {kv} from '@vercel/kv';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {Configuration, OpenAIApi} from 'openai-edge';
import {customAlphabet} from 'nanoid';
export const runtime = 'edge';
import {defaultMessages} from 'lib/utils/systemMessages';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7); // 7-character random string

const projectCompletion = `Based on the data, shipper number 27 (DHL) is has the lowest average cost for shipping containers above size 35`;
export async function POST(req: Request) {
  const json = await req.json();
  const {messages, previewToken, projectId} = json;

  if (projectId === process.env.PROJECT_ID) {
    // Split the hardcoded response into chunks
    const chunkSize = 8; // Adjust chunk size as needed
    const chunks: string[] = [];
    for (let i = 0; i < projectCompletion.length; i += chunkSize) {
      chunks.push(projectCompletion.substring(i, i + chunkSize));
    }

    // Create a ReadableStream for streaming the chunks
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          await new Promise((resolve) => setTimeout(resolve, 200)); // Delay in milliseconds
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
