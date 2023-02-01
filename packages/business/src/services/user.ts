import {updateHtml, updateText} from 'email';
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
    html: updateHtml({email}),
    subject: '[Glyphx] Email address updated',
    text: updateText({email}),
    to: [email, previousEmail],
  });
}

export async function updateName(id, name) {
  return await prisma.user.update({
    data: {name},
    where: {id},
  });
}
