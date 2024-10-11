'use client';
import {useEffect} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {configsAtom, windowSizeAtom} from 'state';
import dynamic from 'next/dynamic';
import {ConfigList} from './_components/config/ConfigList';
import {RadiusLengths} from './_components/config/RadiusLengths';
import {Toggles} from './_components/config/Toggles';
import {Colors} from './_components/config/Colors';
import {useConfigs} from 'lib';
import {Properties as Axes} from './_components/properties';

const Controls = dynamic(() => import('./_components/config/Controls').then((mod) => mod.Controls));

export const ModelConfigSidebar = () => {
  //utilities
  const {data, isLoading} = useConfigs();
  const {height} = useRecoilValue(windowSizeAtom);
  const setConfigs = useSetRecoilState(configsAtom);

  useEffect(() => {
    if (!isLoading && data) {
      setConfigs(data);
    }
  }, [isLoading, data, setConfigs]);
  return (
    <div
      id="sidebar"
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-gray h-full scrollbar-none w-[250px] shrink-0`}
    >
      <div
        style={{
          height: `${height && height - 60}px`,
        }}
        className={`overflow-y-auto w-full scrollbar-none`}
      >
        <Axes />
        <Controls />
        <ConfigList />
        <RadiusLengths />
        <Toggles />
        <Colors />
      </div>
    </div>
  );
};
