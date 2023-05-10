import React from 'react';
import { useRecoilValue } from 'recoil';
import { State } from './State';
import { stateSnapshotsSelector } from 'state';

export const StateList = () => {
  const states = useRecoilValue(stateSnapshotsSelector);

  return (
    states && (
      <div className="lg:block border-b border-gray">
        <ul className="overflow-auto grow">
          {states.map((item, idx) => (
            <State key={idx} item={item} idx={idx} />
          ))}
        </ul>
      </div>
    )
  );
};
