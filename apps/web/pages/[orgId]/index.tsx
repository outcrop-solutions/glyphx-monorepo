import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HomeErrorFallback, HomeSuspenseFallback } from '@/partials/fallback';
import useSWR from 'swr';

import dynamic from 'next/dynamic';
import { ToastWrapper } from 'partials/layout/ToastWrapper';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { useRouter } from 'next/router';
import { fetcher } from 'lib/fetcher';
const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
  // suspense: true,
});

export default function Projects() {
  const router = useRouter();
  const { orgId } = router.query;

  const session = useRequireAuth();
  const { data } = useSWR(session && typeof orgId !== 'undefined' && `/api/project?orgId=${orgId}`, fetcher); // Populate state layer data
  // @ts-ignore
  useEffect(() => {
    if (data) {
      // @ts-ignore
      setProjects(data);
    }
  }, [data, session]);

  return (
    <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
      <ToastWrapper>
        <ErrorBoundary
          FallbackComponent={HomeErrorFallback}
          resetKeys={[]}
          onError={(error, info) => console.log({ error, info })}
          onReset={() => {
            console.log('reset');
          }}
        >
          {/* Fallback for when data is loading */}
          <Suspense fallback={<HomeSuspenseFallback />}>
            <DynamicHome />
          </Suspense>
        </ErrorBoundary>
      </ToastWrapper>
    </div>
  );
}

// THIS IS FOR WHEN WE WANT TO ADD IN SSR AUTH and STATIC GENERATION OF FALLBACK UI to improve LCP and TTFB (WHICH DOES NOT HAVE RECOIL)
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // const { Auth } = await withSSRContext(context);
//   // const SSR = withSSRContext({ req: context.req });

//   try {
//     // const user = await Auth.currentAuthenticatedUser();
//     // if (!user) {
//     //   return {
//     //     redirect: {
//     //       permanent: false,
//     //       destination: "/auth/signin",
//     //     },
//     //   };
//     // }
//     // const response = (await SSR.API.graphql(
//     //   graphqlOperation(listProjects)
//     // )) as {
//     //   data: ListProjectsQuery;
//     // };
//     // const filtered = response.data.listProjects.items.filter(
//     //   (el) => el?.shared?.includes(user.username) || el.author === user.id
//     // );
//     // // console.log({ user });
//     // let sorted = sortArray(filtered, {
//     //   by: "updatedAt",
//     //   order: "desc",
//     // });
//     return {
//       props: {
//         authenticated: true,
//         // userData: JSON.stringify(user),
//         // data: sorted,
//       },
//     };
//   } catch (error) {
//     console.log({ error });
//     return {
//       redirect: {
//         permanent: false,
//         destination: "/auth/signin",
//       },
//     };
//   }
// };
