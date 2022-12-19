import React, { Fragment, useRef, useState } from 'react';
import { matchingFilesAtom } from '@state/files';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilValue } from 'recoil';

export default function DecisionModal() {
    const matchingFiles = useRecoilValue(matchingFilesAtom);
  //   const [open, setOpen] = useState(matchingFiles && matchingFiles.length > 0 ? true : false);

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const renderButtons = () => {
    return (
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => setOpen(false)}
        >
          Deactivate
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={() => setOpen(false)}
          ref={cancelButtonRef}
        >
          Cancel
        </button>
      </div>
    );
  };
  return (
    <div>
      <Transition.Root show={open}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-secondary-midnight px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow sm:mx-0 sm:h-10 sm:w-10"></div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-light-gray">
                        <b className="text-yellow">File Collision</b> detected
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-light-gray">
                          Some of your files are similar to each other. Please select the operations you would like to
                          perform:<br />
                          <br />
                          <b className="text-yellow">ADD</b> will create a new table,{' '}
                          <b className="text-yellow">APPEND</b> will add to the existing table, and{' '}
                          <b className="text-yellow">REPLACE</b> will replace the contents of the target table. <br/><br/> This
                          action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <li>{matchingFiles?.map(({new, existing}) => (
                    <>hello</>
                  ))}

                  {renderButtons()}
                  </li>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
