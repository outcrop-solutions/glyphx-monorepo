import React, { Suspense, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
// Amplify
import { withSSRContext, graphqlOperation } from "aws-amplify";

import { getProject } from "graphql/queries";
import { createProject } from "graphql/mutations";

// Layout
import { Header } from "partials";
import { ProjectSidebar } from "partials";
import { CommentsSidebar } from "partials";
import { MainSidebar } from "partials";

// Project View
import GridLoader from "react-spinners/GridLoader";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GridHeader } from "partials";
import { Invite } from "partials";

// Hooks
import { useFileSystem } from "services/useFileSystem";
// import { ReorderConfirmModal } from "partials";
import { GetProjectQuery } from "API";
import { useRouter } from "next/router";
import { useProject } from "services";
import { useSocket } from "services";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { gridLoadingSelector } from "@/state/files";
import { GridContainer } from "@/partials/datagrid/GridContainer";
import { showReorderConfirmAtom } from "@/state/properties";
import { projectIdAtom, selectedProjectSelector } from "@/state/project";
import { userSelector } from "@/state/user";
import { ErrorFallback } from "@/partials/errors";
import { ErrorBoundary } from "react-error-boundary";

export default function Project({ user, data }) {
  const [error, setError] = useState(false);
  // console.log({ data, user });
  const { query } = useRouter();
  const { projectId } = query;
  const setProjectId = useSetRecoilState(projectIdAtom);

  useEffect(() => {
    if (projectId) setProjectId(projectId);
  }, [projectId]);

  const setUser = useSetRecoilState(userSelector(userData));

  // setUser(user);
  // setUser(JSON.parse(user));

  const dataGridLoading = useRecoilValue(gridLoadingSelector);
  // const showReorderConfirm = useRecoilValue(showReorderConfirmAtom);

  // Qt hook
  const { setCommentsPosition, setFilterSidebarPosition } = useSocket();

  // Filesystem hook
  const { filesOpen, openFile, closeFile } = useFileSystem(projectId);

  // Project Hook
  const { isDropped, handleDrop } = useProject(projectId);

  const toastRef = React.useRef(null);
  const [share, setShare] = useState(false);

  return (
    <div className="flex h-screen max-w-5xl-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {/* {showReorderConfirm ? <ReorderConfirmModal /> : null} */}
      {/* Sidebar */}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        resetKeys={[projectId]}
        onReset={() => {
          setProjectId([projectId]);
        }}
      >
        <Suspense fallback={<div>Loading ...</div>}>
          <MainSidebar />
          {/* Content area */}
          <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none bg-primary-dark-blue">
            {/*  Site header */}
            <Header />
            {/* <hr className={project ? "mx-0" : "mx-6"} /> */}
            <main className="h-full">
              <div className="flex grow relative h-full">
                <DndProvider backend={HTML5Backend}>
                  <ProjectSidebar
                    error={error}
                    openFile={openFile}
                    setFilterSidebarPosition={setFilterSidebarPosition}
                    handleDrop={handleDrop}
                    toastRef={toastRef}
                  />
                  <div className="w-full flex overflow-auto">
                    <div className="min-w-0 flex-auto w-full">
                      <div className="flex flex-col h-full">
                        {filesOpen && filesOpen.length > 0 && (
                          <GridHeader closeFile={closeFile} />
                        )}
                        {dataGridLoading ? (
                          <div className="h-full w-full flex justify-center items-center border-none">
                            <GridLoader
                              loading={dataGridLoading}
                              size={100}
                              color={"yellow"}
                            />
                          </div>
                        ) : (
                          <GridContainer isDropped={isDropped} />
                        )}
                      </div>
                    </div>
                    <>{share ? <Invite setShare={setShare} /> : <></>}</>
                    <CommentsSidebar
                      setCommentsPosition={setCommentsPosition}
                    />
                  </div>
                </DndProvider>
              </div>
            </main>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  console.log({ params });
  const { Auth } = await withSSRContext(context);
  const SSR = withSSRContext({ req: context.req });

  // not technically necessary if fetched client side
  try {
    const user = await Auth.currentAuthenticatedUser();
    if (!user)
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    const response = (await SSR.API.graphql(
      graphqlOperation(getProject, { id: params.projectId })
    )) as {
      data: GetProjectQuery;
    };
    console.log({ user, response });

    return {
      props: {
        authenticated: true,
        user: JSON.stringify(user),
        data: response.data.getProject,
      },
    };
  } catch (error) {
    console.log({ error, msg: error.errors });
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
};
