import React from 'react';

export default function SuspenseFallback() {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh] bg-secondary-midnight">
      <p className="text-white text-2xl font-roboto font-light p-2">Loading ...</p>
    </div>
  );
}
