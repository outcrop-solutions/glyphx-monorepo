'use client';
import React from 'react';
import Link from 'next/link';
import FullLogo from 'svg/full-logo.svg';
import SmallLogo from 'svg/small-logo.svg';
import {useSetRecoilState} from 'recoil';
import {cameraAtom, drawerOpenAtom, imageHashAtom} from 'state';
import {useParams} from 'next/navigation';

export const Logo = () => {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const projectId = params?.projectId;
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);

  return (
    <Link href={`/${projectId ?? workspaceId ?? ''}`}>
      <div
        onClick={() => {
          setDrawer(false);
          window?.core?.ToggleDrawer(false);
          setImageHash({
            imageHash: false,
          });
          setCamera({});
        }}
        className={`py-1 ${projectId ? 'justify-center' : ''}`}
      >
        {projectId ? <SmallLogo /> : <FullLogo />}
      </div>
    </Link>
  );
};
