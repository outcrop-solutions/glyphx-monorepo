import React, { Suspense } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

// Amplify
import { withSSRContext, graphqlOperation } from "aws-amplify";
import { getProject } from "graphql/queries";

// import { ReorderConfirmModal } from "partials";
import { GetProjectQuery } from "API";

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
  const { projectId } = router.query;
  return (
    <ErrorBoundary
      FallbackComponent={ProjectErrorFallback}
      resetKeys={[projectId]}
      onReset={() => {}}
    >
      {/* <Suspense fallback={<ProjectSuspenseFallback user={user} data={data} />}> */}
        <DynamicProject />
      {/* </Suspense> */}
    </ErrorBoundary>
  );
}

// GET LATEST DATA TO POPULATE INITAL RENDER
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const { projectId } = params;
  console.log({ params });
  const { Auth } = await withSSRContext(context);
  const SSR = withSSRContext({ req: context.req });

  try {
    // if user not authenticated, redirect serverside to prevent flash
    const user = await Auth.currentAuthenticatedUser();
    if (!user)
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };

    // Get Fallback data
    const response = (await SSR.API.graphql(
      graphqlOperation(getProject, { id: projectId })
    )) as {
      data: GetProjectQuery;
    };
    console.log({ user, response });

    return {
      props: {
        user: JSON.stringify(user),
        data: response.data.getProject,
      },
    };
  } catch (error) {
    // TODO: hook up SENTRY here
    // console.log({ error, msg: error.errors });
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
};
