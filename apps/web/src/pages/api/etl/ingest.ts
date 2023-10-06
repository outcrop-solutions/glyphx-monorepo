import {webTypes} from 'types';
import {NextApiRequest, NextApiResponse} from 'next';
import {Initializer} from 'business';
import {Session} from 'next-auth';
import {validateSession} from 'lib/server/session';
import {fileIngestion} from 'lib/server/etl/fileIngestion';

/**
 * UNCOMMENT TO DISABLE BUFFERING OF RESPONSE i.e to read raw data or stream
// BY DEFAULT NEXT SLS ENV BUFFERS REQS :/
 */
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export const maxDuration = 300;
export const config = {ƒ
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 300,
};

export default async function fileIngest(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  } // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?.id) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return fileIngestion(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
}
