'use client';
import {useMemo} from 'react';
import {useOthers, useSelf} from 'liveblocks.config';
import {AvatarStack} from '../../primitives/AvatarStack';

export function DocumentHeaderAvatars() {
  const self = useSelf();
  const others = useOthers();
  const users = useMemo(() => (self ? [self, ...others] : others), [self, others]);

  return (
    <AvatarStack
      avatars={users.map((user) => {
        return {
          name: user?.info?.name ?? 'Demo User',
          src: user?.info?.image ?? '',
          color: user?.info?.color,
        };
      })}
      max={5}
      size={20}
      tooltip
      tooltipProps={{sideOffset: 28}}
    />
  );
}
