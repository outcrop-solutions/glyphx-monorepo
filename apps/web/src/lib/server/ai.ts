import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { Configuration, OpenAIApi } from 'openai-edge';
import { systemMessage } from 'lib/utils/systemMessages';
import { projectService, projectTemplateService } from '@glyphx/business';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Create generative ai completion
 *
 * @route POST /api/completion
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createCompletion = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { payload } = req.body;
  try {
    const openai = new OpenAIApi(configuration);
    const project = await projectService.getProject(payload.modelId);
    const templates = await projectTemplateService.getProjectTemplates(
      {},
      0,
      10,
      project.tags.map((t) => t._id)
    );

    const messages = systemMessage(payload.fileStats, templates);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0,
      // stream: true,
      max_tokens: 300,
    });

    const result = await response.json();
    res.status(200).json({ data: result });

    // return new StreamingTextResponse(stream);
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
