'use server';
import {error, constants} from 'core';
import {Configuration, OpenAIApi} from 'openai-edge';
import {systemMessage} from './utils/systemMessages';
import {projectTemplateService} from '../../business/src/services';

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

export const createCompletion = async (payload) => {
  try {
    const openai = new OpenAIApi(configuration);
    const templates = await projectTemplateService.getProjectTemplates({});

    const messages = systemMessage(payload.fileStats, templates);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0,
      // stream: true,
      max_tokens: 300,
    });

    return await response.json();
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the project logs', 'projectId', '', err);
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e};
  }
};
