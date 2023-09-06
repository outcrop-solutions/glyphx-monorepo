'use client';
import useTemplates from 'lib/client/hooks/useTemplates';
import Button from 'app/_components/Button';
import PinnedIcon from 'public/svg/pinned-icon.svg';
import {useState} from 'react';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import produce from 'immer';

export const PinnedProjects = () => {
  const {data} = useTemplates();
  const setModals = useSetRecoilState(modalsAtom);
  const [loading] = useState(false);
  const {templates} = data;

  return (
    <div className="pt-8 mb-8 relative">
      <p className="font-rubik font-light text-[18px] text-white leading-[21px] tracking-[0.01em]">
        Recently Used Templates
      </p>
      <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {templates &&
          templates.map((template) => (
            <li
              key={template._id}
              className="relative group col-span-1 shadow-sm rounded border border-transparent bg-secondary-space-blue hover:cursor-pointer hover:border-white flex items-center justify-between"
            >
              <div className="flex items-center max-w-full">
                <div className="flex items-center justify-center w-16 h-16 text-white">
                  <PinnedIcon />
                </div>
                <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray truncate group-hover:text-white">
                  {template.name}
                </div>
              </div>
              <div className="hidden group-hover:flex absolute right-2">
                <Button
                  className=""
                  disabled={loading}
                  onClick={() =>
                    setModals(
                      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
                        draft.modals.push({
                          type: webTypes.constants.MODAL_CONTENT_TYPE.TEMPLATE_PREVIEW,
                          isSubmitting: false,
                          data: template,
                        });
                      })
                    )
                  }
                >
                  <span>View</span>
                </Button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
