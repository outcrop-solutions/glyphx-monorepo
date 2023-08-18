import React from 'react';
import { ConfigName } from './ConfigName';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { configNameSelector, currentConfigAtom } from 'state';

export const ConfigList = () => {
  const configNames = useRecoilValue(configNameSelector);
  const setCurrentConfig = useSetRecoilState(currentConfigAtom);

  return (
    <ul role="list" className="-mx-2 mt-2 space-y-1">
      {configNames.map((name, idx) => (
        <li onClick={() => setCurrentConfig(idx)} key={name}>
          <ConfigName idx={idx} name={name} />
        </li>
      ))}
    </ul>
  );
};
