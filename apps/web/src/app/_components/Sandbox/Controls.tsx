import React from 'react';

export const Controls = () => {
  return (
    <div className="space-y-2 mb-4">
      <div className="text-white">Controls</div>
      <div className="flex items-center space-x-2">
        <div
          id="move-left-button"
          className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
        >
          Left
        </div>
        <div
          id="move-right-button"
          className="bg-yellow h-full w-full rounded px-1 flex items-center justify-center cursor-pointer"
        >
          Right
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div
          id="move-forward-button"
          className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
        >
          Forward
        </div>
        <div
          id="move-backward-button"
          className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
        >
          Backward
        </div>
      </div>
    </div>
  );
};
