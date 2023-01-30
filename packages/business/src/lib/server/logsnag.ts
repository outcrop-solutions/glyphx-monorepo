import { LogSnag } from 'logsnag';

// @ts-ignore
const logsnag = new LogSnag(process.env.LOGSNAG_API_TOKEN);

export const log = (channel, event, description, icon) =>
  logsnag.publish({
    // @ts-ignore
    project: 'glyphx',
    channel,
    event,
    description,
    icon: icon || '🔥',
    notify: true,
  });
