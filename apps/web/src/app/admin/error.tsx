'use client';
import React from 'react';
import {FallbackProps} from 'react-error-boundary';

export const AdminErrorFallback = ({error, resetErrorBoundary}: FallbackProps) => {
  return (
    <div className="w-full h-full">
      <h2 className="text-white text-center">Admin Error Boundary</h2>
      <h3 className="text-red-500 text-center">error: {error.message}</h3>
      <button className="text-white text-center" onClick={resetErrorBoundary}>
        Ok
      </button>
    </div>
  );
};
