import { useState, useRef, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  DocumentDuplicateIcon,
  DotsVerticalIcon,
  PlusCircleIcon,
  XIcon,
} from '@heroicons/react/outline';
import { database as databaseTypes } from '@glyphx/types';
import toast from 'react-hot-toast';
import CopyToClipboard from 'react-copy-to-clipboard';
import { _updateRole, api } from 'lib';

export function PermissionsDropDown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  const copyToClipboard = () => toast.success('Copied to clipboard!');
  // mutations
  const changeRole = (memberId, role) => {
    api({ ..._updateRole(memberId, role) });
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center justify-center p-3 space-x-3 rounded hover:bg-secondary-midnight">
          <DotsVerticalIcon className="w-5 h-5" />
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
        <Menu.Items className="absolute right-0 z-40 mt-2 origin-top-right border divide-y divide-gray-100 rounded w-60 bg-secondary-deep-blue">
          <div className="p-2">
            <Menu.Item>
              <button className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-blue-600 hover:text-white">
                <span>
                  Change role to &quot;
                  <div className="relative inline-block w-1/2 border border-gray rounded md:w-1/4">
                    <select
                      className="w-full px-5 py-2 capitalize rounded appearance-none bg-transparent"
                      disabled={isSubmitting}
                      // onChange={
                      //   // changeRole(
                      //   //   member._id,
                      //   //   event.target.value as unknown as
                      //   //     | databaseTypes.constants.ROLE
                      //   //     | databaseTypes.constants.PROJECT_ROLE
                      //   // )
                      // }
                    >
                      <option value={databaseTypes.constants.PROJECT_ROLE.READ_ONLY}>
                        {databaseTypes.constants.PROJECT_ROLE.READ_ONLY.toLowerCase()}
                      </option>
                      <option value={databaseTypes.constants.ROLE.OWNER}>
                        {databaseTypes.constants.ROLE.OWNER.toLowerCase()}
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </span>
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-red-600 rounded hover:bg-red-600 hover:text-white"
                // onClick={() => removeMember(member?._id)}
              >
                <span>Remove Team Member</span>
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
