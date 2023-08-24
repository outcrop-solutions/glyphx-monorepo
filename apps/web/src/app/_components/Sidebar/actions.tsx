'use client';
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { useWorkspace, useWorkspaces } from 'lib/client';
import { CreateWorkspace } from 'app/[workspaceId]/_components/controls/CreateWorkspace';

const Actions = () => {
  const router = useRouter();
  const { data: result } = useWorkspace();
  const { data, isLoading } = useWorkspaces();

  // local state
  const handleWorkspaceChange = (workspace) => {
    router.replace(`/account/${workspace?.slug}`);
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-5 space-y-3">
      <CreateWorkspace />
      <Listbox value={result?.workspace} onChange={handleWorkspaceChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-secondary-midnight rounded-lg shadow-md cursor-default">
            <span className="block text-white truncate">
              {isLoading
                ? 'Fetching workspaces...'
                : data?.workspaces?.length === 0
                ? 'No workspaces found'
                : result?.workspace === undefined
                ? 'Select a workspace...'
                : result?.workspace?.name}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          {data?.workspaces?.length > 0 && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute w-full mt-1 overflow-auto text-base rounded-md shadow-lg max-h-60 bg-secondary-midnight">
                {data.workspaces.map((workspace, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `${active ? 'bg-primary-dark-blue' : 'bg-secondary-midnight'}
                          cursor-pointer select-none relative py-4 pl-10 pr-4`
                    }
                    value={workspace}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`${selected ? 'font-bold' : 'font-normal'} block truncate`}>
                          {workspace.name}
                        </span>
                        {selected ? (
                          <span
                            className={`${active ? 'text-blue-600' : 'text-blue-600'}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  );
};

export default Actions;
