'use client';
import {ArrowRightIcon} from '@heroicons/react/outline';
import {startTransition, useEffect, useRef, useState} from 'react';
import UserCombobox from './UserCombobox';
import {createProjectAnnotation, createStateAnnotation} from 'business/src/actions/annotation';

export const InputArea = ({id, type}) => {
  const [value, setValue] = useState('');
  const [showCombo, setShowCombo] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (value.includes('@')) {
      setShowCombo(true);
      // @ts-ignore
      textAreaRef.current?.blur();
    } else {
      setShowCombo(false);
      // @ts-ignore
      textAreaRef.current?.focus();
    }
  }, [value]);

  return (
    <div className="w-full">
      <div className="relative flex w-full">
        <textarea
          ref={textAreaRef}
          rows={3}
          name="comment"
          id="comment"
          className="block w-full pb-8 resize-none placeholder:text-xs text-xs bg-transparent py-1 px-2 text-gray-900 outline-none border border-t-yellow placeholder:text-gray-400 ring-none"
          placeholder="This looks interesting..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="absolute bottom-0 inset-x-0 z-[9999]">
          {showCombo && <UserCombobox setShowCombo={setShowCombo} setValue={setValue} />}
        </div>
        <div className="absolute bottom-0 right-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <button
              onClick={() =>
                startTransition(() => {
                  if (type === 'PROJECT') {
                    createProjectAnnotation(id, value);
                  } else {
                    createStateAnnotation(id, value);
                  }
                })
              }
              className="inline-flex items-center rounded-md bg-gray px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
            >
              <ArrowRightIcon className="shrink-0 h-2 w-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
