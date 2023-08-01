// layout
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import WorkspaceLayout from 'layouts/WorkspaceLayout';
import { useWorkspace } from 'lib';
import useTemplates from 'lib/client/hooks/useTemplates';
import { SuspenseFallback } from 'partials/fallback';
import { Suspense, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { templatesAtom, workspaceAtom } from 'state';
import Home from 'views/home';

const Workspace = () => {
  const { data, isLoading } = useWorkspace();
  const { data: templateData, isLoading: templateLoading } = useTemplates();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !templateLoading) {
      setWorkspace(data.workspace);
      setTemplates(templateData);
    }
  }, [data, isLoading, setWorkspace, templateLoading]);

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
