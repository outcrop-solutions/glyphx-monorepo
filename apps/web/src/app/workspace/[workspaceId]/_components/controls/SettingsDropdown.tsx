'use client';
import React, {Fragment} from 'react';
import {Menu, Transition} from '@headlessui/react';
import {signOut} from 'next-auth/react';
import Link from 'next/link';
import {
  CogIcon,
  DesktopComputerIcon,
  ExclamationIcon,
  LogoutIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';
import {useUrl} from 'lib/client/hooks';
import {Route} from 'next';
import {useParams} from 'next/navigation';
import {projectAtom} from 'state';
import {useRecoilValue} from 'recoil';

export const SettingsDropdown = () => {
  const url = useUrl();
  const params = useParams();
  const project = useRecoilValue(projectAtom);
  const workspaceId = params?.workspaceId ?? project?.workspace?.id;

  const logOut = () => {
    const result = confirm('Are you sure you want to logout?');
    if (result) {
      signOut({callbackUrl: `${url}/login`});
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left z-30">
      <div>
        <Menu.Button className="flex items-center justify-center bg-transparent p-1 space-x-3 border rounded hover:bg-secondary-midnight">
          <CogIcon aria-hidden="true" className="w-5 h-5" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-40 mt-2 origin-top-right border divide-y divide-gray-100 bg-secondary-space-blue rounded">
          <div className="p-2">
            <Menu.Item>
              <Link
                href={`/${workspaceId}/settings` as Route}
                className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
              >
                <UserCircleIcon aria-hidden="true" className="w-5 h-5" />
                <span>Account</span>
              </Link>
            </Menu.Item>
          </div>
          {workspaceId && (
            <div className="p-2">
              <Menu.Item>
                <Link
                  href={`/${workspaceId}/settings/team` as Route}
                  className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
                >
                  <UserGroupIcon aria-hidden="true" className="w-5 h-5" />
                  <span>Team</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  href={`/${workspaceId}/settings/general` as Route}
                  className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
                >
                  <CogIcon aria-hidden="true" className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  href={`/${workspaceId}/settings/advanced` as Route}
                  className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
                >
                  <ExclamationIcon aria-hidden="true" className="w-5 h-5" />
                  <span>Advanced</span>
                </Link>
              </Menu.Item>
            </div>
          )}
          <div className="p-2">
            <Menu.Item>
              <Link
                href={'https://glyphx.co' as Route}
                className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
              >
                <DesktopComputerIcon aria-hidden="true" className="w-5 h-5" />
                <span>Resources</span>
              </Link>
            </Menu.Item>
          </div>
          <div className="p-2">
            <Menu.Item>
              <button
                className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white group"
                onClick={logOut}
              >
                <LogoutIcon aria-hidden="true" className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
