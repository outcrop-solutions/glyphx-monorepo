import nodemailer from 'nodemailer';

export const EMAIL_CONFIG = {
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  service: process.env.EMAIL_SERVICE,
};

const TRANSPORT = nodemailer.createTransport(EMAIL_CONFIG);

export interface ISendMail {
  from?: string | null | undefined;
  html: string;
  subject: string;
  text: string;
  to: string | any[];
}

export async function sendMail({from, html, subject, text, to}: ISendMail) {
  const data = {
    from: from ?? process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  process.env.NODE_ENV === 'production'
    ? await TRANSPORT.sendMail(data)
    : console.log(data);
}

export default TRANSPORT;
