'use client';
import {ArrowRightIcon} from '@heroicons/react/outline';
import {_createAnnotation, api} from 'lib';
import {useCallback, useState} from 'react';
import {toast} from 'react-hot-toast';
import {useSWRConfig} from 'swr';

export const InputArea = ({id, type}) => {
  const {mutate} = useSWRConfig();
  const [value, setValue] = useState('');

  const createAnnotation = useCallback(() => {
    if (value === '') {
      toast.success('Please provide a comment to annotate!');
      return;
    }
    api({
      ..._createAnnotation({id, type, value}),
      onSuccess: () => {
        setValue('');
        // TODO: revalidate annotations
        // mutate(`/api/annotations/project/${id}`);
        // mutate(`/api/annotations/state/${id}`);
      },
    });
  }, [id, type, value]);
  return (
    <div className="min-w-0 flex-1 px-2 py-1">
      <div className="relative">
        <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray focus-within:ring-2 focus-within:ring-yellow">
          <label htmlFor="comment" className="sr-only">
            Reply to thread
          </label>
          <textarea
            rows={3}
            name="comment"
            id="comment"
            className="block w-full resize-none border bg-transparent py-1 px-2 text-gray-900 outline-none border-gray placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Reply to thread..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          {/* Spacer element to match the height of the toolbar */}
          <div className="py-2" aria-hidden="true">
            {/* Matches height of button in toolbar (1px border + 36px content height) */}
            <div className="py-px">
              <div className="h-9" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 right-auto flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <button
              onClick={createAnnotation}
              className="inline-flex items-center rounded-md bg-gray px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
            >
              <ArrowRightIcon className="shrink-0 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
