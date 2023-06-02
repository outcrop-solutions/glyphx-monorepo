import React, { useState, useCallback } from 'react';
import { web as webTypes } from '@glyphx/types';
import { StateList } from './StateList';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { projectAtom } from 'state/project';
import { PlusIcon } from '@heroicons/react/outline';
import { modalsAtom } from 'state';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';

export const States = () => {
  const project = useRecoilValue(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const [isCollapsed, setCollapsed] = useState(false);

  const createState = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.CREATE_STATE,
          isSubmitting: false,
          data: project,
        });
      })
    );
  }, [project, setModals]);

  return (
    <div className="group flex flex-col grow relative">
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
              States{' '}
            </span>
          </a>
        </div>
        <PlusIcon
          color="#CECECE"
          className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
          onClick={createState}
        />
      </summary>
      {!isCollapsed && <StateList />}
    </div>
  );
};
