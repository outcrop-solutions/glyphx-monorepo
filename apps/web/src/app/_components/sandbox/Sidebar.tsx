import React, { useEffect } from 'react';
import { ConfigList } from './ConfigList';
import { RadiusLengths } from './RadiusLengths';
import { Toggles } from './Toggles';
import { Colors } from './Colors';
import { Controls } from './Controls';
import { useConfigs } from 'lib';
import { useSetRecoilState } from 'recoil';
import { configsAtom } from 'state';

export const SandboxSidebar = () => {
  const { data, isLoading } = useConfigs();
  const setConfigs = useSetRecoilState(configsAtom);

  useEffect(() => {
    if (!isLoading) {
      setConfigs(data.configs);
    }
  }, [isLoading, data, setConfigs]);

  return (
    data && (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secondary-dark-blue px-6">
        <nav className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-y-7">
            <div role="list" className="space-y-1 mt-10">
              <Controls />
              <hr className="text-white" />
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
    )
  );
};
