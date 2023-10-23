'use client';
import {MenuIcon} from '@heroicons/react/outline';
import React from 'react';
import {useRecoilState} from 'recoil';
import {mobileMenuAtom} from 'state';
import {useParams} from 'next/navigation';

export const MenuBtn = () => {
  const [showMenu, setMenuVisibility] = useRecoilState(mobileMenuAtom);
  const params = useParams();
  const projectId = params?.projectId;
  const toggleMenu = () => setMenuVisibility(!showMenu);
  return projectId ? (
    <button onClick={toggleMenu} className="absolute right-0 p-5 md:hidden">
      <MenuIcon className="w-6 h-6" />
    </button>
  ) : null;
};
