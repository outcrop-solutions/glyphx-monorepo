import { createServer, IncomingMessage, ServerResponse } from 'http';
import { NextApiHandler } from 'next';
import { apiResolver } from 'next/dist/server/api-utils/node';

export const getMockServer = (handler: NextApiHandler, query: Record<string, string> = {}, bodyParser = true) => {
  const requestHandler = (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
    apiResolver(
      request,
      response,
      query,
      Object.assign(handler, {
        config: {
          api: {
            bodyParser,
          },
        },
      }),
      {
        previewModeEncryptionKey: '',
        previewModeId: '',
        previewModeSigningKey: '',
      },
      true
    );

  return createServer(requestHandler);
};
