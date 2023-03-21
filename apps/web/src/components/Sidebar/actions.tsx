import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, PlusIcon, SelectorIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

import Button from 'components/Button/index';
import Modal from 'components/Modal/index';
import { useWorkspaces } from 'lib/client';
import { api, _createWorkspace } from 'lib';
import { useWorkspace } from 'providers/workspace';

const Actions = () => {
  const { data, isLoading } = useWorkspaces();
  const { workspace, setWorkspace } = useWorkspace();
  const router = useRouter();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setModalState] = useState(false);
  const validName = name.length > 0 && name.length <= 16;

  // local state
  const handleNameChange = (event) => setName(event.target.value);
  const handleWorkspaceChange = (workspace) => {
    setWorkspace(workspace);
    router.replace(`/account/${workspace?.slug}`);
  };
  const toggleModal = () => setModalState(!showModal);

  // mutations
  const createWorkspace = (event) => {
    event.preventDefault();
    api({
      ..._createWorkspace(name),
      setLoading: setSubmittingState,
     
      onSuccess: () => {
        toggleModal();
        setName('');
      },
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-5 space-y-3">
      <Button className="text-white bg-secondary-deep-blue hover:bg-blue-500" onClick={toggleModal}>
        <PlusIcon className="w-5 h-5 text-white" aria-hidden="true" />
        <span className="whitespace-nowrap">Create Workspace</span>
      </Button>
      <Modal show={showModal} title="Create a Workspace" toggle={toggleModal}>
        <div className="space-y-0 text-sm text-gray-600">
          <p>Create a workspace to keep your team&apos;s content in one place.</p>
          <p>You&apos;ll be able to invite everyone later!</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Workspace Name</h3>
          <p className="text-sm text-gray-400">Name your workspace. Keep it simple.</p>
          <input
            className="w-full px-3 py-2 border rounded bg-transparent"
            disabled={isSubmitting}
            onChange={handleNameChange}
            type="text"
            value={name}
          />
        </div>
        <div className="flex flex-col items-stretch">
          <Button className="" disabled={!validName || isSubmitting} onClick={createWorkspace}>
            <span>Create Workspace</span>
          </Button>
        </div>
      </Modal>
      <Listbox value={workspace} onChange={handleWorkspaceChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-secondary-midnight rounded-lg shadow-md cursor-default">
            <span className="block text-white truncate">
              {isLoading
                ? 'Fetching workspaces...'
                : data?.workspaces?.length === 0
                ? 'No workspaces found'
                : workspace === null
                ? 'Select a workspace...'
                : workspace.name}
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
              <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base rounded-md shadow-lg max-h-60">
                {data?.workspaces.map((workspace, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `${active ? 'bg-secondary-midnight' : 'bg-secondary-midnight'}
                          cursor-pointer select-none relative py-2 pl-10 pr-4`
                    }
                    value={workspace}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${selected ? 'font-bold' : 'font-normal'} bg-secondary-midnight block truncate`}
                        >
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
