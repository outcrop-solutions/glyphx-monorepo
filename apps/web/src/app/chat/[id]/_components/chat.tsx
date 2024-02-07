'use client';
import {useState} from 'react';
import {toast} from 'react-hot-toast';
import Link from 'next/link';
import {useChat, type Message} from 'ai/react';
import {cn} from 'lib/utils/cn';
import {ChatList} from './chat-list';
import {ChatPanel} from './chat-panel';
import {EmptyScreen} from './empty-screen';
import {ChatScrollAnchor} from './chat-scroll-anchor';
import {PromptForm} from './prompt-form';
import {useRecoilValue} from 'recoil';
import {windowSizeAtom} from 'state';
import {useParams} from 'next/navigation';

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
}

export function Chat({id, initialMessages, className}: ChatProps) {
  const [isCollapsed, setCollapsed] = useState(false);
  const {height} = useRecoilValue(windowSizeAtom);
  const params = useParams();
  const {messages, append, reload, stop, isLoading, input, setInput} = useChat({
    initialMessages,
    id,
    body: {
      projectId: params?.projectId,
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
  });

  return (
    <div className="group flex flex-col grow h-full">
      <summary
        onClick={() => {
          setCollapsed(!isCollapsed);
        }}
        className="flex h-8 py-4 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray"
      >
        <div className="flex ml-2 items-center h-8">
          <span className="">
            <svg
              className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill="#CECECE"
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <Link href="/">
            <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
              {' '}
              Threads{' '}
            </span>
          </Link>
        </div>
      </summary>
      {!isCollapsed && (
        <div className="h-full relative">
          <div
            style={{
              height: `${height && height - 120}px`,
            }}
            className={cn('pt-4 pb-20 grow overflow-y-scroll', className)}
          >
            {messages.length ? (
              <>
                <ChatList messages={messages} />
                <ChatScrollAnchor trackVisibility={isLoading} />
              </>
            ) : (
              <EmptyScreen setInput={setInput} />
            )}
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-secondary-deep-blue">
            <ChatPanel
              id={id}
              isLoading={isLoading}
              stop={stop}
              append={append}
              reload={reload}
              messages={messages}
              input={input}
              setInput={setInput}
            />
            <PromptForm
              onSubmit={async (value) => {
                await append({
                  id,
                  content: value,
                  role: 'user',
                });
              }}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
