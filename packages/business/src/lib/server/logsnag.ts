import {LogSnag} from 'logsnag';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/naming-convention
const logsnag = new LogSnag(process.env.LOGSNAG_API_TOKEN);

export function log(channel, event, description, icon) {
  logsnag.publish({
    // project: 'glyphx',
    channel,
    event,
    description,
    icon: icon || '🔥',
    notify: true,
  });
}
