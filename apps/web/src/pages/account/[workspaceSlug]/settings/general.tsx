import { useEffect, useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isSlug from 'validator/lib/isSlug';

import Button from 'components/Button/index';
import Card from 'components/Card/index';
import Content from 'components/Content/index';
import Meta from 'components/Meta/index';
import { AccountLayout } from 'layouts/index';
import { _updateWorkspaceName, _updateWorkspaceSlug, api } from 'lib';
import { workspaceService, Initializer } from '@glyphx/business';
import { useWorkspace } from 'providers/workspace';

const General = ({ isTeamOwner, workspace }) => {
  const router = useRouter();
  const { setWorkspace } = useWorkspace();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState(workspace.name || '');
  const [slug, setSlug] = useState(workspace.slug || '');
  const validName = name?.length > 0 && name?.length <= 16;
  const validSlug =
    slug?.length > 0 && slug?.length <= 16 && isSlug(slug) && isAlphanumeric(slug, undefined, { ignore: '-' });

  // local state
  const copyToClipboard = () => toast.success('Copied to clipboard!');
  const handleNameChange = (event) => setName(event.target.value);
  const handleSlugChange = (event) => setSlug(event.target.value);

  // mutations
  const changeName = (event) => {
    event.preventDefault();
    api({
      ..._updateWorkspaceName({ slug: workspace.slug, name }),
      setLoading: setSubmittingState,
      onError: null,
      onSuccess: null,
    });
  };
  const changeSlug = (event) => {
    event.preventDefault();
    api({
      ..._updateWorkspaceSlug({ slug: workspace.slug, newSlug: slug }),
      setLoading: setSubmittingState,
      onError: null,
      onSuccess: (data) => {
        router.replace(`/account/${data?.slug}/settings/general`);
      },
    });
  };

  useEffect(() => {
    setName(workspace.name);
    setSlug(workspace.slug);
    setWorkspace(workspace);
  }, [workspace, setWorkspace]);

  return (
    <AccountLayout>
      <Meta title={`Glyphx - ${workspace.name} | Settings`} />
      <Content.Title title="Workspace Information" subtitle="Manage your workspace details and information" />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Workspace Name" subtitle="Used to identify your Workspace on the Dashboard">
            <input
              className="px-3 py-2 border rounded md:w-1/2 bg-transparent"
              disabled={isSubmitting || !isTeamOwner}
              onChange={handleNameChange}
              type="text"
              value={name}
            />
          </Card.Body>
          <Card.Footer>
            <small>Please use 16 characters at maximum</small>
            {isTeamOwner && (
              <Button className="bg-primary-yellow" disabled={!validName || isSubmitting} onClick={changeName}>
                Save
              </Button>
            )}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Body title="Workspace Slug" subtitle="Used to identify your Workspace on the Dashboard">
            <div className="flex items-center space-x-3">
              <input
                className="px-3 py-2 border rounded md:w-1/2 bg-transparent"
                disabled={isSubmitting || !isTeamOwner}
                onChange={handleSlugChange}
                type="text"
                value={slug}
              />
              <span className={`text-sm ${slug?.length > 16 && 'text-red-600'}`}>{slug?.length} / 16</span>
            </div>
          </Card.Body>
          <Card.Footer>
            <small>Please use 16 characters at maximum. Hyphenated alphanumeric characters only.</small>
            {isTeamOwner && (
              <Button className="" disabled={!validSlug || isSubmitting} onClick={changeSlug}>
                Save
              </Button>
            )}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Body title="Workspace ID" subtitle="Used when interacting with APIs">
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded md:w-1/2">
              <span className="overflow-x-auto">{workspace.workspaceCode}</span>
              <CopyToClipboard onCopy={copyToClipboard} text={workspace.workspaceCode}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  await Initializer.init();
  const session = await getSession(context);
  let isTeamOwner = false;
  let workspace = null;

  if (session) {
    workspace = await workspaceService.getWorkspace(
      session?.user?.userId,
      session?.user?.email,
      context.params.workspaceSlug
    );
    if (workspace) {
      isTeamOwner = await workspaceService.isWorkspaceOwner(session?.user?.email, workspace);
    }
  }

  return {
    props: JSON.parse(
      JSON.stringify({
        isTeamOwner,
        workspace,
      })
    ),
  };
};

export default General;
