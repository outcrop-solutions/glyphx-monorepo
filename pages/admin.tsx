import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AdminErrorFallback } from "@/partials/fallback/admin.error";
import { AdminSuspenseFallback } from "@/partials/fallback/admin.suspense";

import dynamic from "next/dynamic";

const DynamicAdmin = dynamic(() => import("views/admin"), {
  ssr: false,
  suspense: true,
});

export const Admin = () => {
  return (
    <ErrorBoundary
      FallbackComponent={AdminErrorFallback}
      resetKeys={[]}
      onReset={() => {}}
    >
      {/* Fallback for when data is loading */}
      <Suspense fallback={AdminSuspenseFallback}>
        <DynamicAdmin />
      </Suspense>
    </ErrorBoundary>
  );
};
