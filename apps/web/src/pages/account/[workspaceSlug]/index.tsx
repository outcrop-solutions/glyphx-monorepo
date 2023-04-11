import dynamic from 'next/dynamic';

// layout
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import ProjectLayout from 'layouts/ProjectLayout';
import { useWorkspace } from 'lib';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { workspaceAtom } from 'state';

const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
});

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
      <ProjectLayout>
        <Meta title={`Glyphx - ${data.workspace.name} | Dashboard`} />
        <Content.Container>
          <DynamicHome />
        </Content.Container>
      </ProjectLayout>
    )
  );
};

export default Workspace;
