'use client';
import {useState, useEffect, useRef} from 'react';
import {Combobox} from '@headlessui/react';
import produce from 'immer';
// import {getSuggestedMembers} from 'actions/src/annotation';
import {useParams} from 'next/navigation';
import {CheckIcon, ChevronDownIcon} from '@heroicons/react/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const UserCombobox = ({setShowCombo, setValue, members, inputRef}) => {
  const [query, setQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const params = useParams();

  const filteredMembers =
    query === ''
      ? members
      : members.filter((member) => {
          return member.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleChange = (val) => {
    setSelectedPerson(val);
    setShowCombo(false);
    setValue(
      produce((draft) => {
        return `${draft}${val.name}`;
      })
    );
  };

  useEffect(() => {
    if (inputRef.current) {
      // @ts-ignore
      inputRef.current?.focus();
    }
  }, []);

  return (
    <Combobox as="div" value={selectedPerson} onChange={(val) => handleChange(val)}>
      <div className="relative mt-2">
        <Combobox.Input
          ref={inputRef}
          style={{background: '#0D1321', fontSize: '14px'}}
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 text-xs text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray sm:text-sm sm:leading-6"
          onChange={(event) => {
            // if empty and delete, blur and delete latest value from value
            setQuery(event.target.value);
          }}
          displayValue={(member) => member?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
        {members.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {members.map((person) => (
              <Combobox.Option
                style={{background: '#0D1321'}}
                key={person.username}
                value={person}
                className={({active}) =>
                  classNames(
                    'relative cursor-default text-xs select-none py-2 pl-3 pr-9',
                    active ? 'bg-gray text-white' : 'text-white'
                  )
                }
              >
                {({active, selected}) => (
                  <>
                    <div className="flex">
                      <span
                        className={classNames(
                          'truncate',
                          selected && 'font-semibold',
                          active ? 'text-white' : 'text-gray'
                        )}
                      >
                        {person.name}
                      </span>
                      <span className={classNames('ml-2 truncate', active ? 'text-white' : 'text-gray')}>
                        {person.username}
                      </span>
                    </div>
                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-gray'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default UserCombobox;
