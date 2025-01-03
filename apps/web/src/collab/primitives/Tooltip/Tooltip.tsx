import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import {forwardRef} from 'react';
import styles from './Tooltip.module.css';

// eslint-disable-next-line react/display-name
export const Tooltip = forwardRef<HTMLDivElement, any>(
  (
    {
      children,
      content,
      open,
      defaultOpen,
      onOpenChange,
      delayDuration,
      disableHoverableContent = true,
      collisionPadding = 10,
      sideOffset = 10,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <RadixTooltip.Root
        defaultOpen={defaultOpen}
        delayDuration={delayDuration}
        disableHoverableContent={disableHoverableContent}
        onOpenChange={onOpenChange}
        open={open}
      >
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={clsx(className, styles.tooltip)}
            ref={ref}
            collisionPadding={collisionPadding}
            sideOffset={sideOffset}
            {...props}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    );
  }
);
