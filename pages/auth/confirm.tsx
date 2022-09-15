import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ConfirmErrorFallback } from "@/partials/fallback/confirm.error";
import { ConfirmSuspenseFallback } from "@/partials/fallback/confirm.suspense";

import dynamic from "next/dynamic";
import { AuthLayout } from "@/partials/layout/AuthLayout";

const DynamicConfirm = dynamic(() => import("views/auth/confirm"), {
  ssr: false,
  suspense: true,
});

export default function Confirm() {
  return (
    <AuthLayout>
      <ErrorBoundary
        FallbackComponent={ConfirmErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        {/* Fallback for when data is loading */}
        <Suspense fallback={ConfirmSuspenseFallback}>
          <DynamicConfirm />
        </Suspense>
      </ErrorBoundary>
    </AuthLayout>
  );
}
