'use client';
import {Properties as Axes} from './_components/properties';
import {Filters} from './_components/filters';
import {useRecoilValue} from 'recoil';
import {windowSizeAtom} from 'state';
import {States} from './_components/states';

export const ModelSidebar = () => {
  //utilities
  const {height} = useRecoilValue(windowSizeAtom);

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
        <Filters />
        <States />
      </div>
    </div>
  );
};
