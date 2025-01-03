'use client';
import React, {useTransition, useState} from 'react';
import Button from 'app/_components/Button';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {useParams} from 'next/navigation';
import ColXIcon from 'svg/col-x-icon.svg';
import ColYIcon from 'svg/col-y-icon.svg';
import ColZIcon from 'svg/col-z-icon.svg';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {createProjectFromTemplate} from 'actions';

export const TemplatePreviewModal = ({modalContent}: webTypes.TemplatePreviewModalProps) => {
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const {workspaceId} = params as {workspaceId: string};
  const setModals = useSetRecoilState(modalsAtom);
  const {data} = modalContent;
  const axes = ['X', 'Y', 'Z'];

  const renderAxisIcon = (axis) => {
    switch (axis) {
      case 'X':
        return <ColXIcon />;
      case 'Y':
        return <ColYIcon />;
      case 'Z':
        return <ColZIcon />;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-4 py-8 w-[500px] space-y-5 bg-secondary-midnight rounded-md text-white">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold">{data?.name}</h3>
        </div>
        <div>
          <h4 className="text-sm font-bold">{data?.description}</h4>
        </div>
        {axes.map((axis) => (
          <>
            <div className="space-y-2">
              <div
                data-type={`${data.shape[axis]?.dataType}`}
                className={`opacity-100 flex items-center justify-center truncate h-[30px] my-1`}
              >
                <span className="inline-flex align-middle space-x-1">
                  <p className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase truncate">
                    {data.shape[axis]?.key}
                  </p>
                  {renderAxisIcon(axis)}
                </span>
              </div>
              <div>
                <p className="w-full px-2 py-1 border border-gray rounded bg-transparent text-[12px]">
                  {data.shape[axis]?.description}
                </p>
              </div>
            </div>
          </>
        ))}
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className=""
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await createProjectFromTemplate(workspaceId, data);
              setModals(
                produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
                  draft.modals.splice(0, 1);
                })
              );
            })
          }
        >
          {isPending ? <LoadingDots /> : <span>Get Template</span>}
        </Button>
      </div>
    </div>
  );
};
