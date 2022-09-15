import React from "react";
import { FallbackProps } from "react-error-boundary";

export const ConfirmErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="w-full h-full">
      <h2 className="text-white text-center">Confirm Error Boundary</h2>
      <h3 className="text-red-500 text-center">{error.message}</h3>
      <h4 className="text-white text-center" onClick={resetErrorBoundary}>Ok</h4>
    </div>
  );
};
