import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SettingsErrorFallback } from "@/partials/fallback/settings.error";
import { SettingsSuspenseFallback } from "@/partials/fallback/settings.suspense";

import dynamic from "next/dynamic";

const DynamicSettings = dynamic(() => import("views/settings"), {
  ssr: false,
  suspense: true,
});

export const Settings = () => {
  return (
    <ErrorBoundary
      FallbackComponent={SettingsErrorFallback}
      resetKeys={[]}
      onReset={() => {
        // setProjects([]);
      }}
    >
      {/* Fallback for when data is loading */}
      <Suspense fallback={SettingsSuspenseFallback}>
        <DynamicSettings />
      </Suspense>
    </ErrorBoundary>
  );
};
