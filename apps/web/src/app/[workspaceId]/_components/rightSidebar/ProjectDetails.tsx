import React, {useState} from 'react';
import Image from 'next/image';
import {FolderIcon} from '@heroicons/react/outline';
import {CheckIcon, PencilIcon, PlusSmIcon} from '@heroicons/react/solid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {useRecoilState} from 'recoil';
import {rightSidebarControlAtom} from 'state';
import Link from 'next/link';

const tabs = [
  {name: 'Info', href: '#', current: true},
  {name: 'Activity', href: '#', current: false},
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
export const ProjectDetails = () => {
  const [projectDetails] = useRecoilState(rightSidebarControlAtom);
  const [name, setName] = useState(projectDetails.data.name);
  const [description, setDescription] = useState(projectDetails.data.description);
  const [members, setMembers] = useState('');
  const [msg] = useState(null);
  const [error] = useState(null);
  const [editShare, setEditShare] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);

  dayjs.extend(relativeTime);

  return (
    <div className="h-full bg-primary-dark-blue p-8 overflow-y-auto">
      <div className="pb-16 space-y-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            {editTitle ? (
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 rounded-sm block border-px bg-gray border-gray shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            ) : (
              <div className="flex">
                <FolderIcon className="h-6 w-6 mr-2 text-white" />
                <h2 className="text-lg font-medium text-white">
                  <span className="sr-only">Details for </span>
                  {projectDetails.data.name}
                </h2>
              </div>
            )}
            <button
              type="button"
              onClick={() => setEditTitle((prev) => !prev)}
              className="ml-4 h-8 w-8 bg-gray rounded-full flex items-center justify-center text-white hover:bg-gray hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow"
            >
              {editTitle ? <CheckIcon className="h-6 w-6" /> : <PencilIcon className="h-6 w-6" aria-hidden="true" />}
              <span className="sr-only">Favorite</span>
            </button>
          </div>
          {msg && (
            <div className="w-full py-2 px-1 my-2 bg-yellow rounded-lg text-center font-bold text-gray">{msg}</div>
          )}
          {error && (
            <div className="w-full py-2 px-1 my-2 bg-rose-500 rounded-lg text-center font-bold text-gray">{error}</div>
          )}

          <div>
            <div className="block mb-2">
              <nav className="relative z-0 rounded-lg shadow flex divide-x divide-gray" aria-label="Tabs">
                {tabs.map((tab, tabIdx) => (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.current ? 'text-white' : 'text-gray hover:text-gray',
                      tabIdx === 0 ? 'rounded-l-lg' : '',
                      tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                      'group relative min-w-0 flex-1 overflow-hidden bg-gray py-2 px-3 text-sm font-medium text-center hover:bg-gray focus:z-10'
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                  >
                    <span>{tab.name}</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        tab.current ? 'bg-indigo-500' : 'bg-transparent',
                        'absolute inset-x-0 bottom-0 h-0.5'
                      )}
                    />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
            <Image layout="fill" src="/images/projectDetails.png" alt="" className="object-cover" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-white">Information</h3>
            <div
              // onClick={updateProject}
              className="cursor-pointer text-center bg-yellow rounded-lg text-black font-bold px-2 py-1 w-20 hover:text-gray"
            >
              Save
            </div>
          </div>
          <dl className="mt-2 border-t border-b border-gray divide-y divide-gray">
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-white mr-2">Owner</dt>
              <dd className="text-slate-300 truncate">J</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-white">Created</dt>
              <dd className="text-slate-300">{dayjs().to(dayjs(projectDetails.data.createdAt))}</dd>
            </div>
            <div className="py-3 flex justify-between text-sm font-medium">
              <dt className="text-white">Last modified</dt>
              <dd className="text-slate-300">{dayjs().to(dayjs(projectDetails.data.updatedAt))}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="font-medium text-white">Description</h3>
          <div className="mt-2 flex items-center justify-between">
            {editDesc ? (
              <textarea
                // type="text"
                name="name"
                id="name"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 rounded-sm block border-px bg-gray border-gray shadow-sm py-2 px-3 w-5/6 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            ) : (
              <p className="text-sm text-white italic">{projectDetails.data.description}</p>
            )}
            <button
              type="button"
              onClick={() => setEditDesc((prev) => !prev)}
              className="-mr-2 h-8 w-8 bg-gray rounded-full flex items-center justify-center text-white hover:bg-gray hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow"
            >
              {editDesc ? (
                <CheckIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <PencilIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-white">Shared with</h3>
            <li onClick={() => setEditShare((prev) => !prev)} className="py-2 flex justify-between items-center">
              <button
                type="button"
                className="group -ml-1 bg-gray p-1 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-yellow"
              >
                {editShare ? (
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <PlusSmIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </li>
          </div>

          {editShare ? (
            <div
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                }
              }}
            >
              <input
                type="email"
                name="email"
                id="email"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="mt-1 rounded-sm block w-full border-px bg-gray border-gray shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
