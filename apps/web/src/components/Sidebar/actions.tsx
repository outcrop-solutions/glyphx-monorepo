import { Fragment, useState } from 'react';
import { useRouter } from 'next/router';
import { Listbox, Transition, Menu } from '@headlessui/react';
import { CheckIcon, PlusIcon, SelectorIcon } from '@heroicons/react/solid';

import Button from 'components/Button/index';
import Modal from 'components/Modal/index';
import { useWorkspace, useWorkspaces, api, _createWorkspace } from 'lib/client';

const Actions = () => {
  const router = useRouter();
  const { data: result } = useWorkspace();
  const { data, isLoading } = useWorkspaces();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setModalState] = useState(false);
  const validName = name.length > 0 && name.length <= 16;

  // local state
  const handleNameChange = (event) => setName(event.target.value);
  const handleWorkspaceChange = (workspace) => {
    router.replace(`/account/${workspace?.slug}`);
  };
  const toggleModal = () => setModalState(!showModal);

  // mutations
  const createWorkspace = (event) => {
    event.preventDefault();
    api({
      ..._createWorkspace(name),
      setLoading: setSubmittingState,
      onSuccess: (result) => {
        router.replace(`/account/${result.data.workspace?.slug}`);
      },
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-5 space-y-3">
      <Menu as="div" className="z-60">
        <div>
          <Menu.Button className="flex items-center bg-gray justify-around px-5 py-2 rounded disabled:opacity-75 text-white">
            {/* <Button.Secondary className="mt-4" onClick={toggleModal}> */}
            <PlusIcon className="w-5 h-5 text-white" aria-hidden="true" />
            <span className="text-white">Workspace</span>
            {/* </Button.Secondary> */}
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
          <Menu.Items className="fixed z-60 left-4 origin-top-left border divide-y divide-gray-100 bg-secondary-space-blue rounded w-[400px]">
            <div className="relative z-60 inline-block p-10 space-y-5 overflow-hidden text-center align-middle transition-all transform bg-secondary-space-blue rounded shadow-xl">
              <div className="space-y-0 text-sm text-gray-600">
                <p>
                  Create a workspace to keep your team&apos;s content in one place. You&apos;ll be able to invite
                  everyone later!
                </p>
                <p></p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Workspace Name</h3>
                <p className="text-sm text-gray-400">Name your workspace. Keep it simple.</p>
                <input
                  className="w-full px-3 py-2 mt-4 border rounded bg-transparent"
                  disabled={isSubmitting}
                  onChange={handleNameChange}
                  type="text"
                  value={name}
                />
              </div>
            </div>
            <div className="flex flex-col items-stretch">
              <Button className="" disabled={!validName || isSubmitting} onClick={createWorkspace}>
                <span>Create Workspace</span>
              </Button>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
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
