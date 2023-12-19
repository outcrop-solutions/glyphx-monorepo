'use client';
import {useRef, useEffect} from 'react';
import {Properties as Axes} from './_components/properties';
import {Filters} from './_components/filters';

import {usePosition} from 'services/usePosition';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {leftCoordinatesAtom, windowSizeAtom} from 'state';
import {States} from './_components/states';

export const ModelSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(leftCoordinatesAtom);
  const {height} = useRecoilValue(windowSizeAtom);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      // @ts-ignore
      const coords = sidebar.current.getBoundingClientRect();
      setCoords(coords);
    }
  }, [setCoords, pos]);

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
        <Axes />
        <Filters />
        <States />
      </div>
    </div>
  );
};
