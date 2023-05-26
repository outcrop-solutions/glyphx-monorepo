import React, { useCallback, useState } from 'react';
import { AnnotationList } from './AnnotationList';
import { _createAnnotation, api } from 'lib';
import { useAnnotations } from 'lib/client/hooks';
import { ArrowRightIcon } from '@heroicons/react/outline';
import { InputArea } from './InputArea';

export const Annotations = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const { data, type, id, isLoading } = useAnnotations();

  return (
    <div className="group flex flex-col grow">
      <summary
        onClick={() => {
          setCollapsed(!isCollapsed);
        }}
        className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray"
      >
        <div className="flex ml-2 items-center">
          <span className="">
            <svg
              className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill="#CECECE"
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <a>
            <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
              {' '}
              Annotations{' '}
            </span>
          </a>
        </div>
      </summary>
      {!isCollapsed && data && !isLoading && <AnnotationList data={data} />}
      <InputArea id={id} type={type} />
    </div>
  );
};
