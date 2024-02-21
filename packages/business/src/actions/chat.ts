'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {kv} from '@vercel/kv';
import {type Message} from 'ai';
import {getServerSession} from 'next-auth';

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: Message[];
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

export async function getChats(userId?: string | null) {
  if (!userId) {
    return [];
  }

  try {
    const pipeline = kv.pipeline();
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true,
    });

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = await pipeline.exec();

    return results as Chat[];
  } catch (error) {
    return [];
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || (userId && chat.userId !== userId)) {
    return null;
  }

  return chat;
}

export async function removeChat({id, path}: {id: string; path: string}) {
  const session = getServerSession();
  const uid = await kv.hget<string>(`chat:${id}`, 'userId');

  await kv.del(`chat:${id}`);
  // @ts-ignore
  await kv.zrem(`user:chat:${session && session.user.id}`, `chat:${id}`);

  revalidatePath('/');
  return revalidatePath(path);
}

export async function clearChats() {
  const session = getServerSession();

  // @ts-ignore
  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1);
  if (!chats.length) {
    return redirect('/');
  }
  const pipeline = kv.pipeline();

  for (const chat of chats) {
    pipeline.del(chat);
    // @ts-ignore
    pipeline.zrem(`user:chat:${session.user.id}`, chat);
  }

  await pipeline.exec();

  revalidatePath('/');
  return redirect('/');
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || !chat.sharePath) {
    return null;
  }

  return chat;
}

export async function shareChat(chat: Chat) {
  const session = getServerSession();

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`,
  };

  await kv.hmset(`chat:${chat.id}`, payload);

  return payload;
}
