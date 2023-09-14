'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {State} from './State';
import {stateSnapshotsSelector} from 'state';

export const StateList = () => {
  const states = useRecoilValue(stateSnapshotsSelector);

  return (
    states && (
      <div className="lg:block border-b border-gray z-60">
        <ul className="overflow-visible grow z-60">
          {states.map((item, idx) => (
            <State key={idx} item={item} idx={idx} />
          ))}
        </ul>
      </div>
    )
  );
};
