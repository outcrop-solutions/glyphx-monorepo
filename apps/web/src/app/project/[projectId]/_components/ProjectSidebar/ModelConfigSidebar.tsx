'use client';
import {useRef, useEffect} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {configsAtom, leftCoordinatesAtom, windowSizeAtom} from 'state';
import dynamic from 'next/dynamic';
import {ConfigList} from './_components/ConfigList';
import {RadiusLengths} from './_components/RadiusLengths';
import {Toggles} from './_components/Toggles';
import {Colors} from './_components/Colors';
import {usePosition} from 'services/usePosition';
import {useConfigs} from 'lib';

const Controls = dynamic(() => import('./_components/Controls').then((mod) => mod.Controls));

export const ModelConfigSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  const {data, isLoading} = useConfigs();
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(leftCoordinatesAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const setConfigs = useSetRecoilState(configsAtom);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      // @ts-ignore
      const coords = sidebar.current.getBoundingClientRect();
      setCoords(coords);
    }
  }, [setCoords, pos]);

  useEffect(() => {
    if (!isLoading) {
      setConfigs(data.configs);
    }
  }, [isLoading, data, setConfigs]);
  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-gray h-full scrollbar-none w-[250px] shrink-0`}
    >
      <div
        style={{
          height: `${height && height - 60}px`,
        }}
        className={`overflow-y-auto w-full scrollbar-none`}
      >
        <Controls />
        <ConfigList />
        <RadiusLengths />
        <Toggles />
        <Colors />
      </div>
    </div>
  );
};
