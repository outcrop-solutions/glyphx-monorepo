import dynamic from 'next/dynamic';

// layout
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import ProjectLayout from 'layouts/ProjectLayout';
import { useWorkspace } from 'lib';

const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
});

const Workspace = () => {
  const { data } = useWorkspace();

  return (
    data && (
      <ProjectLayout>
        <Meta title={`Glyphx - ${data.name} | Dashboard`} />
        <Content.Container>
          <DynamicHome />
        </Content.Container>
      </ProjectLayout>
    )
  );
};

export default Workspace;
