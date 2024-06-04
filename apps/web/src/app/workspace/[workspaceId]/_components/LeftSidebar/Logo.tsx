'use client';
import React from 'react';
import Link from 'next/link';
import FullLogo from 'svg/full-logo.svg';
import SmallLogo from 'svg/small-logo.svg';
import {useSetRecoilState} from 'recoil';
import {drawerOpenAtom} from 'state';
import {useParams} from 'next/navigation';

export const Logo = () => {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const projectId = params?.projectId;
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  return (
    <Link href={`/${projectId ?? workspaceId ?? ''}`}>
      <div
        onClick={() => {
          setDrawer(false);
        }}
        className={`py-1 ${projectId ? 'justify-center' : ''}`}
      >
        {projectId ? <SmallLogo /> : <FullLogo />}
      </div>
    </Link>
  );
};
