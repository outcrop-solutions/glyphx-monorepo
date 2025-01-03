import {notFound} from 'next/navigation';
import {getChat} from 'lib/actions/chat';
import {Chat} from './_components/chat';
import {getServerSession} from 'next-auth';

// export const runtime = 'edge';
// export const preferredRegion = 'home';

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({params}: ChatPageProps) {
  const session = await getServerSession();

  if (!session) {
    notFound();
  }

  const chat = await getChat(params.id, session?.user?.id);

  if (!chat) {
    notFound();
  }

  if (chat?.userId !== session?.user?.id) {
    notFound();
  }

  return <Chat id={chat.id} initialMessages={chat.messages} />;
}
