// layout
import React from 'react';
import {PinnedProjects} from '../_components/workspace';
import {Banner} from './_components/Banner';

export default async function WorkspacePage() {
  return (
    <div className="flex flex-col h-full w-full space-y-5 overflow-y-auto bg-transparent">
      <div className="relative flex flex-col w-full h-full">
        <div className="h-full px-4 mx-auto pt-4">
          <Banner />
          <div className="flex grow relative h-full">
            <div className="w-full flex text-white h-full">
              <div className="py-2 w-full max-w-9xl">
                <PinnedProjects />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
