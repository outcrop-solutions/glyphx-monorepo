import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import ProjectLayout from 'layouts/ProjectLayout';
import { useWorkspace } from 'providers/workspace';
import dynamic from 'next/dynamic';
const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
  // suspense: true,
});

const Workspace = () => {
  const { workspace } = useWorkspace();

  return (
    workspace && (
      <ProjectLayout>
        <Meta title={`Glyphx - ${workspace.name} | Dashboard`} />
        <Content.Container>
          <DynamicHome workspace={workspace} />
        </Content.Container>
      </ProjectLayout>
    )
  );
};

export default Workspace;
