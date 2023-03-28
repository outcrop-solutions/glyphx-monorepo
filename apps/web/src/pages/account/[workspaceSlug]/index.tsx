import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import ProjectLayout from 'layouts/ProjectLayout';
import dynamic from 'next/dynamic';
import { useRecoilValue } from 'recoil';
import { workspaceAtom } from 'state';

const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
  // suspense: true,
});

const Workspace = () => {
  const workspace = useRecoilValue(workspaceAtom);

  return (
    workspace.name && (
      <ProjectLayout>
        <Meta title={`Glyphx - ${workspace.name} | Dashboard`} />
        <Content.Container>
          <DynamicHome />
        </Content.Container>
      </ProjectLayout>
    )
  );
};

export default Workspace;
