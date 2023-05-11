// layout
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import WorkspaceLayout from 'layouts/WorkspaceLayout';
import { useWorkspace } from 'lib';
import { SuspenseFallback } from 'partials/fallback';
import { Suspense, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { workspaceAtom } from 'state';
import Home from 'views/home';

const Workspace = () => {
  const { data, isLoading } = useWorkspace();
  const setWorkspace = useSetRecoilState(workspaceAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading) {
      setWorkspace(data.workspace);
    }
  }, [data, isLoading, setWorkspace]);

  return (
    data && (
      <>
        <Suspense fallback={SuspenseFallback}>
          <WorkspaceLayout>
            <Meta title={`Glyphx - ${data?.workspace?.name} | Dashboard`} />
            <Content.Container>
              <Home />
            </Content.Container>
          </WorkspaceLayout>
        </Suspense>
      </>
    )
  );
};

export default Workspace;
