import React from "react";
import { FallbackProps } from "react-error-boundary";

export const HomeErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="w-full h-full">
      <h2 className="text-white text-center">Home Error Boundary</h2>
      <h3 className="text-white text-center">{error.message}</h3>
      <h4 className="text-white text-center" onClick={resetErrorBoundary}>Ok</h4>
    </div>
  );
};
