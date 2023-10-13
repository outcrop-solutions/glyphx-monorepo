// layout
import React from 'react';
import {PinnedProjects} from '../_components/workspace';

export default async function WorkspacePage() {
  return (
    <div className="flex flex-col h-full w-full space-y-5 overflow-y-auto bg-transparent">
      <div className="relative flex flex-col w-full h-full">
        <div className="h-full">
          <div className="flex grow relative h-full">
            <div className="w-full flex text-white h-full ">
              <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                <PinnedProjects />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
