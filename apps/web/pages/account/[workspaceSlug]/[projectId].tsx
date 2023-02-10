import React, { Suspense } from "react";
import { useRouter } from "next/router";

import {
  ProjectErrorFallback,
  ProjectSuspenseFallback,
} from "@/partials/fallback";
import { ErrorBoundary } from "react-error-boundary";

import dynamic from "next/dynamic";

const DynamicProject = dynamic(() => import("views/project"), {
  ssr: false,
  // suspense: true,
});

export default function Project({ user, data }) {
  const router = useRouter();
  const { orgId, projectId } = router.query;
  return (
    <ErrorBoundary
      FallbackComponent={ProjectErrorFallback}
      resetKeys={[projectId, orgId]}
      onReset={() => {}}
    >
      {/* <Suspense fallback={<ProjectSuspenseFallback user={user} data={data} />}> */}
        <DynamicProject />
      {/* </Suspense> */}
    </ErrorBoundary>
  );
}

