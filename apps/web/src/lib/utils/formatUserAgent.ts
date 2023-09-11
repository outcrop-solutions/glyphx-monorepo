import type {NextApiRequest} from 'next';
import {databaseTypes} from 'types';
import useragent from 'useragent';

export const formatUserAgent = (req: NextApiRequest): {agentData: databaseTypes.IUserAgent; location: string} => {
  // Get the user agent from the request headers
  const userAgentString = req.headers['user-agent'];
  // Parse the user agent string using the useragent package
  const agent = useragent.parse(userAgentString);
  // Get the IP address of the client
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // userAgent interface
  const agentData: databaseTypes.IUserAgent = {
    userAgent: userAgentString,
    platform: agent.os.family,
    appName: agent.family,
    appVersion: agent.toVersion(),
    vendor: agent.device.vendor,
    language: req.headers['accept-language'],
  };
  return {
    agentData,
    location: clientIP as string,
  };
};
