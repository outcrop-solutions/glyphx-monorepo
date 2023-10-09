'use client';
import React from 'react';
import Link from 'next/link';
import FullLogo from 'public/svg/full-logo.svg';
import SmallLogo from 'public/svg/small-logo.svg';
import {useSetRecoilState} from 'recoil';
import {drawerOpenAtom} from 'state';

export const Logo = () => {
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  return (
    <Link href="/account">
      <div
        onClick={() => {
          setDrawer(false);
          window?.core?.ToggleDrawer(false);
        }}
        className="py-1"
      >
        {projectId ? <SmallLogo /> : <FullLogo />}
      </div>
    </Link>
  );
};
