import nodemailer from "nodemailer";
import nunjucks from "nunjucks";
import path from "path";

export function isEmailEnabled(): boolean {
  if (!process.env.EMAIL_ENABLED) return false;
  if (!process.env.EMAIL_HOST) return false;
  if (!process.env.EMAIL_PORT) return false;
  if (!process.env.EMAIL_HOST_USER) return false;
  if (!process.env.EMAIL_HOST_PASSWORD) return false;
  if (!process.env.EMAIL_FROM) return false;

  return true;
}

nunjucks.configure("email/", {
  autoescape: true,
});

// const transporter = isEmailEnabled()
//   ? nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: process.env.EMAIL_PORT === 465,
//       auth: {
//         user: process.env.EMAIL_HOST_USER,
//         pass: process.env.EMAIL_HOST_PASSWORD,
//       },
//     })
//   : null;

async function sendMail({
  html,
  subject,
  to,
  from,
  text,
}: {
  html: string;
  subject: string;
  to: string;
  from: string;
  text: string;
}) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "postmaster@rivents.io", // generated ethereal user
      pass: process.env.EMAIL_HOST_PASSWORD, // generated ethereal password
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
export async function sendInviteModelEmail({
  title, 
  name, 
  email,
  inviteUrl,
  organizationName,
}: {
  title: string; //page title
  name: string; // user's name
  email: string; //email of invitee
  inviteUrl: string;
  organizationName: string;
}) {
  const html = nunjucks.render("invitePage.njk", {
    inviteUrl,
    organizationName,
  });
  try {
    let info = await sendMail({
      html,
      from: `${name} from ${organizationName} <${name}@${organizationName}.com>`,
      // from: `${name} @ ${organizationName} <${name}${organizationName}.com>`,
      subject: `You've been invited to join the page ${title} by ${name}`,
      to: email,
      text: `Join ${name} on Glyphx by visiting ${inviteUrl}`,
    });
    console.log({ emailInfo: info });
  } catch (error) {
    console.log({ error });
  }
}

export async function sendInviteOrgEmail({ 
  name, 
  email,
  inviteUrl,
  organizationName,
}: {
  name: string; // user's name
  email: string; //email of invitee
  inviteUrl: string;
  organizationName: string;
}) {
  const html = nunjucks.render("invitePage.njk", {
    inviteUrl,
    organizationName,
  });
  try {
    let info = await sendMail({
      html,
      from: `${name} @ ${organizationName} <${name}${organizationName}.com>`,
      subject: `You've been invited to join ${organizationName} on Rivents.io by ${name}`,
      to: email,
      text: `Join ${name} on Glyphx by visiting ${inviteUrl}`,
    });
    console.log({ emailInfo: info });
  } catch (error) {
    console.log({ error });
  }
}

// export async function sendResetPasswordEmail(email: string, resetUrl: string) {
//   const html = nunjucks.render("reset-password.jinja", {
//     resetUrl,
//   });
//   await sendMail({
//     html,
//     subject: "Reset Rivents Password",
//     to: email,
//     text: `Reset your password by visiting ${resetUrl}`,
//   });
// }

// export async function sendNewOrgEmail(company: string, email: string) {
//   if (!process.env.SITE_MANAGER_EMAIL) return;

//   const html = nunjucks.render("new-organization.jinja", {
//     company,
//     email,
//   });
//   await sendMail({
//     html,
//     subject: `New company created: ${company}`,
//     to: process.env.SITE_MANAGER_EMAIL,
//     text: `Company Name: ${company}\nOwner Email: ${email}`,
//   });
// }

// export async function sendNewMemberEmail(
//   name: string,
//   email: string,
//   organization: string,
//   ownerEmail: string
// ) {
//   const html = nunjucks.render("new-member.jinja", {
//     name,
//     email,
//     organization,
//   });

//   await sendMail({
//     html,
//     subject: `A new user joined your Rivents account: ${name} (${email})`,
//     to: ownerEmail,
//     text: `Organization: ${organization}\nName: ${name}\nEmail: ${email}`,
//   });
// }
