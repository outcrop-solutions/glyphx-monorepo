'use client';
import {PencilIcon, TrashIcon} from '@heroicons/react/outline';
import {activeStateAtom, showLoadingAtom} from 'state';
import {useRecoilState, useSetRecoilState} from 'recoil';
import StateIcon from 'svg/state.svg';
import ActiveStateIcon from 'svg/active-state.svg';
import Image from 'next/image';

export const Threshold = ({item, idx}) => {
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  return (
    <li
      key={item.id}
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex items-center justify-between cursor-pointer relative z-60"
    >
      <div className="hidden group-states-hover:flex absolute p-2 rounded border bg-primary-dark-blue w-56 h-56 bottom-16 z-60">
        {item.imageHash && (
          <Image alt="state" width={300} height={200} src={`data:image/png;base64,${item.imageHash}`} />
        )}
      </div>
      <div className="flex items-center justify-center h-6 w-6">
        {activeState === idx ? <StateIcon className="" /> : <ActiveStateIcon />}
      </div>
      <div className="block group-states-hover:text-white transition duration-150 truncate grow ml-2">
        <span
          className={`w-full text-left text-light-gray text-sm ${activeState === idx ? 'text-white' : ''} font-medium`}
        >
          {item.name}
        </span>
      </div>
      <div className="invisible group-states-hover:visible flex gap-x-2 justify-between items-center">
        <PencilIcon className="h-4 w-4" />
        <TrashIcon className="h-4 w-4" />
      </div>
    </li>
  );
};
