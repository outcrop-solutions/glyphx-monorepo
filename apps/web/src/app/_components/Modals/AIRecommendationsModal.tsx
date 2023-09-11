import React, {useCallback, useState} from 'react';
import {webTypes} from 'types';
import {_createProjectFromTemplate, api} from 'lib';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {modalsAtom, templatesAtom, workspaceAtom} from 'state';
import {useRouter, useParams} from 'next/navigation';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {LoadingDots} from '../Loaders/LoadingDots';
import Button from '../Button';
import {Route} from 'next';

export const AIRecommendationsModal = ({modalContent: any}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const {workspaceSlug} = params as {workspaceSlug: string};
  const {templates} = useRecoilValue(templatesAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const {_id} = useRecoilValue(workspaceAtom);
  // mutations
  const getTemplate = useCallback(
    (template) => {
      api({
        ..._createProjectFromTemplate(_id!.toString(), template),
        setLoading: (state) => {
          setLoading(state as boolean);
        },
        onSuccess: (data: any) => {
          setLoading(false);
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals.splice(0, 1);
            })
          );
          router.push(`/account/${workspaceSlug}/${data._id}` as Route);
        },
      });
    },
    [_id, router, setModals, workspaceSlug]
  );

  return (
    <div className="rounded-lg px-20 py-10 bg-secondary-midnight w-[1000px] h-[800px] z-60">
      <div className="text-white text-xl py-4">AI Recommendations</div>
      <div>
        {templates &&
          templates?.map((template, idx) => (
            <>
              {idx % 2 === 0 && idx < 4 && (
                <div
                  className={`group my-8 flex shadow-sm rounded border border-transparent bg-secondary-space-blue hover:cursor-pointer hover:border-white p-2`}
                >
                  <div className="flex-1 flex items-center justify-between border-t border-r border-b border-transparent  rounded-r-md whitespace-wrap">
                    <div className="flex-1 px-4 py-2 text-sm">
                      <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray  group-hover:text-white">
                        {template.name}
                      </div>
                    </div>
                    <Button className="" disabled={loading} onClick={() => getTemplate(template)}>
                      {loading ? <LoadingDots /> : <span>Get Template</span>}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ))}
      </div>
      <div className="relative py-4">
        <p className="font-rubik font-light text-[18px] text-white text-xl">Templates</p>
        <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates &&
            templates?.map((template) => (
              <li
                key={template.name}
                className={`group col-span-1 flex shadow-sm rounded border  ${'border-transparent'} bg-secondary-space-blue hover:cursor-pointer hover:border-white p-2`}
              >
                <div className="flex-1 flex items-center justify-between border-t border-r border-b border-transparent  rounded-r-md whitespace-wrap">
                  <div className="flex-1 px-4 py-2 text-sm">
                    <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray  group-hover:text-white">
                      {template.name}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
