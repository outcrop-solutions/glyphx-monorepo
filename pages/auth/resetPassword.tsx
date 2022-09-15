import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ResetPasswordErrorFallback } from "@/partials/fallback/reset.error";
import { ResetPasswordSuspenseFallback } from "@/partials/fallback/reset.suspense";

import dynamic from "next/dynamic";
import { AuthLayout } from "@/partials/layout/AuthLayout";

const DynamicResetPassword = dynamic(() => import("views/auth/resetPassword"), {
  ssr: false,
  suspense: true,
});

export default function ResetPassword() {
  return (
    <AuthLayout>
      <ErrorBoundary
        FallbackComponent={ResetPasswordErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        {/* Fallback for when data is loading */}
        <Suspense fallback={ResetPasswordSuspenseFallback}>
          <DynamicResetPassword />
        </Suspense>
      </ErrorBoundary>
    </AuthLayout>
  );
}
