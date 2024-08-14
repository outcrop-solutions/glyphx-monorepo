'use client';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { State } from './State';
import { activeStateAtom, stateSnapshotsSelector } from 'state';

export const StateList = () => {
  const states = useRecoilValue(stateSnapshotsSelector);
  const activeState = useRecoilValue(activeStateAtom)
  return (
    states && (
      <div className="lg:block border-b border-gray z-60">
        <ul className="overflow-visible grow z-60">
          {states.map((item, idx) => (
            <State key={idx} item={item} activeState={activeState} />
          ))}
        </ul>
      </div>
    )
  );
};
