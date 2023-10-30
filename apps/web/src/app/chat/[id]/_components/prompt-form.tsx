import {UseChatHelpers} from 'ai/react';
import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import {Button} from './ui/button';
import {IconArrowElbow} from './ui/icons';
import {Tooltip, TooltipContent, TooltipTrigger} from './ui/tooltip';
import {useEnterSubmit} from 'lib/client/hooks/useEnterSubmit';
import {useRouter} from 'next/navigation';

export interface PromptProps extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptForm({onSubmit, input, setInput, isLoading}: PromptProps) {
  const {formRef, onKeyDown} = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput('');
        await onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="relative flex w-full grow flex-col items-center justify-center overflow-hidden px-2 border-t border-gray">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="w-full resize-none bg-transparent py-4 text-xs focus-within:outline-none"
        />
        <div className="absolute right-0 top-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={isLoading || input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
