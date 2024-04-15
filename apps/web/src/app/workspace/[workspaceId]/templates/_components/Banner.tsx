import {UploadIcon} from '@heroicons/react/outline';
import React from 'react';
import BrainIcon from 'svg/brain-icon.svg';
import BannerPattern from 'svg/banner-pattern.svg';

export const Banner = () => {
  const numberOfFiles = 10;
  const numberOfCols = 10;
  const daysSinceSync = 10;
  return (
    <div className="flex border border-nav rounded-md w-full bg-secondary-space-blue pl-3">
      <div className="w-1/2 space-y-2 py-4">
        <div className="text-5xl text-navText">
          You have <span className="text-white font-normal">00</span> Models Ready.
        </div>
        <div className="flex itmes-center justify-between">
          <div className="text-3xl text-white">
            {numberOfFiles}
            <span className="text-gray text-sm"> Files</span>
          </div>
          <div className="text-3xl text-white">
            {numberOfCols}
            <span className="text-gray text-sm"> Columns</span>
          </div>
          <div className="text-3xl text-white">
            {daysSinceSync}
            <span className="text-gray text-sm"> Days Since Update</span>
          </div>
        </div>
        <div className="text-white text-sm">GlyphAI analyzes your data to find insights you didn’t know you had.</div>
        <div className="flex w-full items-center justify-between space-x-2">
          <div className="w-1/2 rounded bg-white text-nav text-center flex items-center justify-center py-1">
            <UploadIcon className="h-4 w-6 mr-1" />
            Upload
          </div>
          <div className="w-1/2 rounded bg-yellow text-nav text-center flex items-center justify-center py-1">
            <BrainIcon className="h-4 w-6 mr-1" />
            Update
          </div>
        </div>
      </div>
      <div className="w-1/2 overflow-hidden -mr-3">
        <div className="float-right">
          <BannerPattern />
        </div>
      </div>
    </div>
  );
};
