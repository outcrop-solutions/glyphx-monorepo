import React from 'react';
// import BarLoader from 'react-spinners/BarLoader';

export const SuspenseFallback = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh] bg-secondary-midnight">
      <p className="text-white text-2xl font-roboto font-light p-2">Loading ...</p>
      {/* <BarLoader color="#FFD959" height={10} width={300} /> */}
    </div>
  );
};