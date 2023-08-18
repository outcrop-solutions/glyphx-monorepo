import React, { useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { useRecoilValue } from 'recoil';
import { currentConfigAtom } from 'state';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ConfigName = ({ name, idx }) => {
  const [selected, setSelected] = useState(false);
  const currentConfig = useRecoilValue(currentConfigAtom);
  return (
    <ClickAwayListener onClickAway={() => setSelected(false)}>
      <div>
        {selected ? (
          <input value={name} />
        ) : (
          <div
            onClick={() => setSelected(true)}
            className={classNames(
              idx === currentConfig ? 'bg-gray-800 text-white' : 'text-white hover:bg-gray-800',
              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
              {idx}
            </span>
            <span className="truncate">{name}</span>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};
