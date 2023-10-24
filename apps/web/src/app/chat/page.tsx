import {nanoid} from 'nanoid';
import {Chat} from './[id]/_components/chat';

export const runtime = 'edge';

export default function IndexPage() {
  const id = nanoid();

  return <Chat id={id} />;
}
