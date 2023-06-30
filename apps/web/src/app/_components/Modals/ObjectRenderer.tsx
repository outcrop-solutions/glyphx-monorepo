import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { Disclosure } from '@headlessui/react';

export const ObjectRenderer = ({ data }) => {
  const [openStates, setOpenStates] = useState({});

  const renderValue = (key, value, isTopLevel, id) => {
    const isObjectValue = typeof value === 'object' && !Array.isArray(value);
    const isArrayValue = Array.isArray(value);

    const keyClassName = 'font-mono text-white text-xs bg-secondary-midnight p-1 rounded-md mr-1';
    const valueClassName = 'font-mono text-light-gray text-xs bg-secondary-midnight p-1 rounded-md';

    if (isObjectValue || isArrayValue) {
      const isOpen = openStates[id] ?? false;

      return (
        <div className="space-y-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              openStates[id] = !isOpen;
              setOpenStates({ ...openStates });
            }}
          >
            {isOpen ? (
              <ChevronDownIcon className="flex-shrink-0 w-5 h-5 mr-2 text-gray-400" />
            ) : (
              <ChevronRightIcon className="flex-shrink-0 w-5 h-5 mr-2 text-gray-400" />
            )}
            <span className={keyClassName}>{key}</span>
            {isArrayValue && <span>[</span>}
            {isObjectValue && <span>{'{'}</span>}
            <span className="text-light-gray text-xs">{`${isArrayValue ? value.length : Object.keys(value).length} ${
              isArrayValue ? 'items' : 'properties'
            }`}</span>
            {isObjectValue && <span>{'}'}</span>}
            {isArrayValue && <span>]</span>}
          </div>
          {isOpen && (
            <div className={`pl-${isTopLevel ? 0 : 2} space-y-4`}>
              {isObjectValue
                ? Object.entries(value).map(([subKey, subValue], i) => (
                    <div key={`${id}-${subKey}`}>{renderValue(subKey, subValue, false, `${id}-${subKey}`)}</div>
                  ))
                : value.map((subValue, i) => (
                    <div key={`${id}-${i}`}>{renderValue(i, subValue, false, `${id}-${i}`)}</div>
                  ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <span className={keyClassName}>{key}: </span>
          <span className={valueClassName}>{value.toString()}</span>
        </div>
      );
    }
  };

  return (
    <div className="border rounded-md shadow-sm">
      {Array.isArray(data) && (
        <div className="flex items-center p-2 space-x-2 bg-secondary-midnight rounded">
          <span className="font-mono text-white">{`[${data.length}]`}</span>
        </div>
      )}
      {typeof data === 'object' && !Array.isArray(data) && (
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-white bg-secondary-midnight hover:bg-secondary-blue rounded focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-50">
                {open ? (
                  <div className="flex">
                    <ChevronDownIcon className="flex-shrink-0 w-5 h-5 mr-2 text-gray-400" />
                    <span>Errors</span>
                  </div>
                ) : (
                  <div className="flex">
                    <ChevronRightIcon className="flex-shrink-0 w-5 h-5 mr-2 text-gray-400" />
                    <span>Errors</span>
                  </div>
                )}
                <span className="flex items-center">
                  <span className="mr-2">{`{${Object.keys(data).length}}`}</span>
                </span>
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-4 pt-2">
                <div className="pl-4 space-y-4">
                  {Object.entries(data).map(([key, value], i) => (
                    <div key={key}>{renderValue(key, value, true, `${key}-${i}`)}</div>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </div>
  );
};
