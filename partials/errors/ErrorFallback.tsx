import React from "react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="w-full h-full">
      <h2 className="text-white text-center">Something went wrong</h2>
      <h3 className="text-white text-center">{error.message}</h3>
      <button className="text-white text-center" onClick={resetErrorBoundary}>Ok</button>
    </div>
  );
};
