import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { systemMessage } from 'lib/utils/systemMessages';
import { projectService, projectTemplateService } from '@glyphx/business';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Create chat completion
 *
 * @route POST /api/chat
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createCompletion = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { payload } = req.body;
  try {
    // const openai = new OpenAIApi(configuration);

    // if (previewToken) {
    //   configuration.apiKey = previewToken;
    // }
    const project = await projectService.getProject(payload.modelId);
    const templates = await projectTemplateService.getProjectTemplates(
      {},
      0,
      10,
      project.tags.map((t) => t._id)
    );

    const messages = systemMessage(payload.fileStats, templates);

    console.log({ messages });
    res.status(200).json({ ok: true });

    // const res = await openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo',
    //   messages,
    //   temperature: 0.7,
    //   stream: true,
    //   max_tokens: 300,
    // });

    // const stream = OpenAIStream(res, {
    //   async onCompletion(completion) {
    //     console.log({ completion });
    //     const title = messages[0].content.substring(0, 100);
    //     const userId = session?.user?.userId;
    //     if (userId) {
    //     TODO:  add chat to user / threads in db
    //       const payload = {
    //         title,
    //         userId,
    //         messages: [
    //           ...messages,
    //           {
    //             content: completion,
    //             role: 'assistant',
    //           },
    //         ],
    //       };
    //   },
    // });

    // return new StreamingTextResponse(stream);
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
