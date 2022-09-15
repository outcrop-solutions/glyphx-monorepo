import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SignInErrorFallback } from "@/partials/fallback/signin.error";
import { SignInSuspenseFallback } from "@/partials/fallback/signin.suspense";

import dynamic from "next/dynamic";
import { AuthLayout } from "@/partials/layout/AuthLayout";

const DynamicSignIn = dynamic(() => import("views/auth/signin"), {
  ssr: false,
});

export default function SignIn() {
  return (
    <AuthLayout>
      <ErrorBoundary
        FallbackComponent={SignInErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        {/* Fallback for when data is loading */}
        <Suspense fallback={SignInSuspenseFallback}>
          <DynamicSignIn />
        </Suspense>
      </ErrorBoundary>
    </AuthLayout>
  );
}
