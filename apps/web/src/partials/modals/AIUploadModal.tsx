import React, { useState } from 'react';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { useCompletion } from 'ai/react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import { modalsAtom } from 'state';
import { completionAtom } from 'state/ai';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
const projects = [
  {
    name: 'Days Sales Outstanding',
  },
  {
    name: 'Logistics by Distribution center',
  },
  {
    name: 'Inventory Count by Warehouse',
  },
  {
    name: 'Purchasing by Raw Material',
  },
  {
    name: 'Manufacturing Production by Raw Facility',
  },
];

export const AIUploadModal = ({ modalContent }: webTypes.CreateProjectModalProps) => {
  // const completion = useRecoilValue(completionAtom);
  const completion = `It looks like the "Days Sales Outstanding" template is for you. Based on the uploaded fileStats, the
        "customer_no" column maps to the "X" key in the template, which represents the name of the customer account or
        generic billing entity. The "time" column maps to the "Y" key in the template, which represents some unit of
        time that makes sense within the billing cycle. Finally, the "DSO" column maps to the "Z" key in the template,
        which represents the average number of days that it takes a company to collect payment for a sale.`;

  const setModals = useSetRecoilState(modalsAtom);
  const [current, setCurrent] = useState(0);

  const formatCompletion = (completion) => {
    const regex = /"(.*?)"/g;
    const matches = completion.match(regex);
    return matches ? matches.map((str) => str.replace(/"/g, ''))[0] : null;
  };

  const recommended = formatCompletion(completion);

  // formatCompletion(completion);
  // const handleClickAway = () => {
  //   setModals(
  //     produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
  //       draft.modals.splice(0, 1);
  //     })
  //   );
  // };

  return (
    <div className="rounded-lg px-20 py-10 bg-secondary-midnight w-[1000px] h-[800px] z-60">
      <div className="text-white text-xl py-4">Recommendations</div>
      {/* @ts-ignore */}
      {completion && <div className="text-white text-md">{completion}</div>}

      <div
        className={`group my-8 flex shadow-sm rounded border  ${'border-transparent'} bg-secondary-space-blue hover:cursor-pointer hover:border-white p-2`}
      >
        <div className="flex-1 flex items-center justify-between border-t border-r border-b border-transparent  rounded-r-md whitespace-wrap">
          <div className="flex-1 px-4 py-2 text-sm">
            <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray  group-hover:text-white">
              {recommended}
            </div>
          </div>
          <div className="px-3 py-1 bg-primary-yellow rounded">Get Template</div>
        </div>
      </div>

      <div className="relative py-4">
        <p className="font-rubik font-light text-[18px] text-white text-xl">Templates</p>
        <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <li
              key={project.name}
              className={`group col-span-1 flex shadow-sm rounded border  ${'border-transparent'} bg-secondary-space-blue hover:cursor-pointer hover:border-white p-2`}
            >
              <div className="flex-1 flex items-center justify-between border-t border-r border-b border-transparent  rounded-r-md whitespace-wrap">
                <div className="flex-1 px-4 py-2 text-sm">
                  <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray  group-hover:text-white">
                    {project.name}
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
