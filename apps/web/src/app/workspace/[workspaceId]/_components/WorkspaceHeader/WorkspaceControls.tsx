'use client';
import {usePathname} from 'next/navigation';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {workspaceAtom} from 'state';

export const WorkspaceControls = () => {
  const workspace = useRecoilValue(workspaceAtom);
  const pathname = usePathname();
  const extension = pathname?.includes('templates')
    ? '> Templates'
    : pathname?.includes('settings')
      ? '> Settings'
      : pathname?.includes('data')
        ? '> Data'
        : '> Projects';

  return (
    <div className="pl-0 py-3">
      <p className="font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] text-white">
        {workspace?.name} {extension}
      </p>
    </div>
  );
};
