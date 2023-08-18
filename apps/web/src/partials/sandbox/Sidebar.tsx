import React from 'react';
import { ConfigList } from './ConfigList';
import { RadiusLengths } from './RadiusLengths';
import { Toggles } from './Toggles';
import { Colors } from './Colors';

export const SandboxSidebar = () => {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secondary-dark-blue px-6">
      <nav className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-y-7">
          <div role="list" className="space-y-1 mt-10">
            <div className="text-xs font-semibold leading-6 text-white">Configurations</div>
            <ConfigList />
            <hr className="text-white" />
            <RadiusLengths />
            <hr className="text-white" />
            <Toggles />
            <hr className="text-white" />
            <Colors />
          </div>
        </div>
      </nav>
    </div>
  );
};
