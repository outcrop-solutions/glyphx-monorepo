'use client';
// layout
import Content from 'app/_components/Content';
import {useWorkspace} from 'lib';
import {useEffect} from 'react';
import {useSetRecoilState} from 'recoil';

// Hooks
import {useRecoilValue} from 'recoil';
import {showProjectsGridViewAtom, workspaceAtom} from 'state';
import {GridView, PinnedProjects, TableView, Templates} from './_components/workspace';
import {RightSidebar} from './_components/rightSidebar';

const Workspace = () => {
  const {data, isLoading} = useWorkspace();
  const setWorkspace = useSetRecoilState(workspaceAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading) {
      setWorkspace(data.workspace);
    }
  }, [data, isLoading, setWorkspace]);
  const isGridView = useRecoilValue(showProjectsGridViewAtom);
  const workspace = useRecoilValue(workspaceAtom);

  return (
    data && (
      <Content.Container>
        <div className="relative flex flex-col w-full h-full">
          <div className="h-full">
            <div className="flex grow relative h-full">
              <div className="w-full flex text-white h-full ">
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  <PinnedProjects />
                  {workspace?.projects && workspace.projects.filter((proj) => !proj.deletedAt)?.length > 0 ? (
                    <>{isGridView ? <GridView /> : <TableView />}</>
                  ) : (
                    <Templates />
                  )}
                </div>
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </Content.Container>
    )
  );
};

export default Workspace;
