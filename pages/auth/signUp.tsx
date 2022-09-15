import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SignUpErrorFallback } from "@/partials/fallback/signup.error";
import { SignUpSuspenseFallback } from "@/partials/fallback/signup.suspense";

import dynamic from "next/dynamic";
import { AuthLayout } from "@/partials/layout/AuthLayout";

const DynamicSignUp = dynamic(() => import("views/auth/signup"), {
  ssr: false,
  suspense: true,
});

export default function SignUp() {
  return (
    <AuthLayout>
      <ErrorBoundary
        FallbackComponent={SignUpErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        {/* Fallback for when data is loading */}
        <Suspense fallback={SignUpSuspenseFallback}>
          <DynamicSignUp />
        </Suspense>
      </ErrorBoundary>
    </AuthLayout>
  );
}
