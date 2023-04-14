// layout
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import WorkspaceLayout from 'layouts/WorkspaceLayout';
import { useWorkspace } from 'lib';
import { AddProjectModal } from 'partials';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showAddProjectAtom, workspaceAtom } from 'state';
import Home from 'views/home';

const Workspace = () => {
  const { data, isLoading } = useWorkspace();
  const setWorkspace = useSetRecoilState(workspaceAtom);
  const showAddProject = useRecoilValue(showAddProjectAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading) {
      setWorkspace(data.workspace);
    }
  }, [data, isLoading, setWorkspace]);

  return (
    data && (
      <>
        {showAddProject ? <AddProjectModal /> : null}
        <WorkspaceLayout>
          <Meta title={`Glyphx - ${data.workspace.name} | Dashboard`} />
          <Content.Container>
            <Home />
          </Content.Container>
        </WorkspaceLayout>
      </>
    )
  );
};

export default Workspace;
