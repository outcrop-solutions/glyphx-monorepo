import {type UseChatHelpers} from 'ai/react';
import {Button} from './ui/button';
import {ButtonScrollToBottom} from './button-scroll-to-bottom';
import {IconRefresh, IconStop} from './ui/icons';

export interface ChatPanelProps
  extends Pick<UseChatHelpers, 'append' | 'isLoading' | 'reload' | 'messages' | 'stop' | 'input' | 'setInput'> {
  id?: string;
}

export function ChatPanel({isLoading, stop, reload, messages}: ChatPanelProps) {
  return (
    <div className="relative bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50% h-full">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button variant="outline" onClick={() => stop()} className="bg-background">
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button variant="outline" onClick={() => reload()} className="bg-background">
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
