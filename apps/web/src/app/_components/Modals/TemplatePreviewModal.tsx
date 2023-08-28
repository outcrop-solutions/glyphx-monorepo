import React, { useCallback, useState } from 'react';
import Button from 'app/_components/Button';
import { _createState, _createProjectFromTemplate, api } from 'lib';
import { web as webTypes } from '@glyphx/types';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modalsAtom, workspaceAtom } from 'state';
import { LoadingDots } from 'app/_components/Loaders/LoadingDots';
import { useRouter } from 'next/navigation';
import ColXIcon from 'public/svg/col-x-icon.svg';
import ColYIcon from 'public/svg/col-y-icon.svg';
import ColZIcon from 'public/svg/col-z-icon.svg';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useParams } from 'next/navigation';

export const TemplatePreviewModal = ({ modalContent }: webTypes.TemplatePreviewModalProps) => {
  const router = useRouter();
  const { workspaceSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const setModals = useSetRecoilState(modalsAtom);
  const { _id } = useRecoilValue(workspaceAtom);
  const { data } = modalContent;
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

  // mutations
  const getTemplate = useCallback(() => {
    api({
      ..._createProjectFromTemplate(_id.toString(), data),
      setLoading: (state) => {
        setLoading(state);
      },
      onSuccess: (data: any) => {
        setLoading(false);
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
        router.push(`/account/${workspaceSlug}/${data._id}`);
      },
    });
  }, [_id, data, router, setModals, workspaceSlug]);

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
        <Button className="" disabled={loading} onClick={getTemplate}>
          {loading ? <LoadingDots /> : <span>Get Template</span>}
        </Button>
      </div>
    </div>
  );
};
