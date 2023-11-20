import {Message} from 'ai';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {cn} from 'lib/utils/cn';
import {CodeBlock} from './ui/codeblock';
import {MemoizedReactMarkdown} from './markdown';
import {IconOpenAI, IconUser} from './ui/icons';
import {ChatMessageActions} from './chat-message-actions';

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({message, ...props}: ChatMessageProps) {
  return (
    <div className={cn('group relative mb-4 flex items-start')} {...props}>
      <div
        className={cn(
          'flex h-4 w-4 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user' ? 'bg-background' : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="px-1 ml-1 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words prose-p:leading-relaxed prose-pre:p-0 text-xs"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({children}) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code({node, inline, className, children, ...props}) {
              if (children.length) {
                if (children[0] == '▍') {
                  return <span className="mt-1 cursor-default animate-pulse">▍</span>;
                }

                children[0] = (children[0] as string).replace('`▍`', '▍');
              }

              const match = /language-(\w+)/.exec(className || '');

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              );
            },
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  );
}
