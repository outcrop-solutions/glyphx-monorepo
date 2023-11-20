import {nanoid} from 'nanoid';
import {Chat} from './[id]/_components/chat';

export default function ChatPage() {
  const id = nanoid();

  return <Chat id={id} />;
}
