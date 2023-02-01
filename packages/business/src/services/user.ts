import {html, text} from 'email/emailUpdate';
import {sendMail} from 'lib/server/mail';
import {prisma} from '@glyphx/database';

export async function deactivate(id) {
  return await prisma.user.update({
    data: {deletedAt: new Date()},
    where: {id},
  });
}

export async function getUser(id) {
  return await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      userCode: true,
    },
    where: {id},
  });
}

export async function updateEmail(id, email, previousEmail) {
  await prisma.user.update({
    data: {
      email,
      emailVerified: null,
    },
    where: {id},
  });
  await sendMail({
    html: html({email}),
    subject: '[Glyphx] Email address updated',
    text: text({email}),
    to: [email, previousEmail],
  });
}

export async function updateName(id, name) {
  return await prisma.user.update({
    data: {name},
    where: {id},
  });
}
