import { html as updateHtml, text as updateText } from './emailUpdate';
import { html as inviteHtml, text as inviteText } from './invitation';
import { html as signInHtml, text as signInText } from './signin';
import { html as workspaceCreateHtml, text as workspaceCreateText } from './workspaceCreate';
import TRANSPORT, { EMAIL_CONFIG, sendMail, ISendMail } from './mail';

export {
  updateHtml,
  updateText,
  inviteHtml,
  inviteText,
  signInHtml,
  signInText,
  workspaceCreateHtml,
  workspaceCreateText,
  sendMail,
  TRANSPORT,
  EMAIL_CONFIG,
};

export type { ISendMail };
