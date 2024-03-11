'use client';
import React from 'react';

const LoadingBar = () => {
  return (
    <div className="w-[400px]">
      <div className="h-1.5 w-full bg-pink-100 overflow-hidden">
        <div className="animate-progress w-full h-full bg-yellow left-right"></div>
      </div>
    </div>
  );
};

export default LoadingBar;
