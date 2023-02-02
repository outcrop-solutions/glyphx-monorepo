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

/**
 * Jonathan:
 * When we check if user is authenticated server side, it will fail. I believe this is because the user details
 * are not stored server side. Rather let's take this out. 
 * 
 */

// GET LATEST DATA TO POPULATE INITAL RENDER
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { params } = context;
//   const { projectId } = params;
//   console.log({ params });
//   const { Auth } = await withSSRContext(context);
//   const SSR = withSSRContext({ req: context.req });

//   try {
//     //testing 
//     // const test = await Auth.signIn("jlamptey@nd.edu", "Test1234567");
//     // console.log({test})
//     // await Auth.signOut()
//     // if user not authenticated, redirect serverside to prevent flash
//     const user = await Auth.currentAuthenticatedUser();
//     if (!user)
//       return {
//         redirect: {
//           permanent: false,
//           destination: "/",
//         },
//       };

//     // Get Fallback data
//     const response = (await SSR.API.graphql(
//       graphqlOperation(getProject, { id: projectId })
//     )) as {
//       data: GetProjectQuery;
//     };
//     console.log({ user, response });

//     return {
//       props: {
//         user: JSON.stringify(user),
//         data: response.data.getProject,
//       },
//     };
//   } catch (error) {
//     // TODO: hook up SENTRY here
//     console.log({ error, msg: error.errors });
//     console.log("help");
//     return {
//       redirect: {
//         permanent: false,
//         destination: "/",
//       },
//     };
//   }
// };
