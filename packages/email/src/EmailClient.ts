import nodemailer from 'nodemailer';

export interface ISendMail {
  from?: string | null | undefined;
  html: string;
  subject: string;
  text: string;
  to: string | any[];
}

export class EmailClient {
  public static TRANSPORT: any;
  // initialize smtp transport
  public static async init() {
    EmailClient.TRANSPORT = nodemailer.createTransport(process.env.EMAIL_SERVER);
  }
  // send email via smtp transport
  static async sendMail({ from, html, subject, text, to }: ISendMail) {
    const data = {
      from: from ?? process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };
    process.env.NODE_ENV === 'production' ? await EmailClient.TRANSPORT.sendMail(data) : console.log(data);
  }
}
