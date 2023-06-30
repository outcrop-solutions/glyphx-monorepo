'use client';
import React from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="w-full h-full">
      <h2 className="text-white text-center">Global Error Boundary</h2>
      <h3 className="text-white text-center">{error.message}</h3>
      <h4 className="text-white text-center" onClick={reset}>
        Ok
      </h4>
    </div>
  );
}
