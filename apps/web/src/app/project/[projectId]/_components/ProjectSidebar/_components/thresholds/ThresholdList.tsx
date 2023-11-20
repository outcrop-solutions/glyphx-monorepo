'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {Threshold} from './Threshold';
import {thresholdsSelector} from 'state';

export const ThresholdList = () => {
  const thresholds = useRecoilValue(thresholdsSelector);

  return (
    thresholds && (
      <div className="lg:block border-b border-gray z-60">
        <ul className="overflow-visible grow z-60">
          {thresholds.map((item, idx) => (
            <Threshold key={idx} item={item} idx={idx} />
          ))}
        </ul>
      </div>
    )
  );
};
