'use client';
import { useEffect, useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/navigation';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isSlug from 'validator/lib/isSlug';

import Button from 'app/_components/Button';
import Card from 'app/_components/Card';
import Content from 'app/_components/Content';
import { _updateWorkspaceName, _updateWorkspaceSlug, api } from 'lib/client';
import { useRecoilValue } from 'recoil';
import { workspaceAtom } from 'state';
import useIsTeamOwner from 'lib/client/hooks/useIsOwner';
import { Route } from 'next';

const General = () => {
  const router = useRouter();
  const workspace = useRecoilValue(workspaceAtom);
  const { data: ownership, isLoading: isOwnershipLoading } = useIsTeamOwner();

  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState(workspace?.name || '');
  const [slug, setSlug] = useState(workspace?.slug || '');

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
      setLoading: (state) => setSubmittingState(state as boolean),
    });
  };

  const changeSlug = (event) => {
    event.preventDefault();
    api({
      ..._updateWorkspaceSlug({ slug: workspace.slug, newSlug: slug }),
      setLoading: (state) => setSubmittingState(state as boolean),
      onSuccess: (data) => {
        router.replace(`/account/${data?.slug}/settings/general` as Route);
      },
    });
  };

  useEffect(() => {
    setName(workspace?.name);
    setSlug(workspace?.slug);
  }, [workspace]);

  return (
    <>
      <Content.Title title="Workspace Information" subtitle="Manage your workspace details and information" />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Workspace Name" subtitle="Used to identify your Workspace on the Dashboard">
            <input
              className="px-3 py-2 border rounded md:w-1/2 bg-transparent"
              disabled={isSubmitting || !ownership?.isTeamOwner}
              onChange={handleNameChange}
              type="text"
              value={name}
            />
          </Card.Body>
          <Card.Footer>
            <small>Please use 16 characters at maximum</small>
            {ownership?.isTeamOwner && (
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
                disabled={isSubmitting || !ownership?.isTeamOwner}
                onChange={handleSlugChange}
                type="text"
                value={slug}
              />
              <span className={`text-sm ${slug?.length > 16 && 'text-red-600'}`}>{slug?.length} / 16</span>
            </div>
          </Card.Body>
          <Card.Footer>
            <small>Please use 16 characters at maximum. Hyphenated alphanumeric characters only.</small>
            {ownership?.isTeamOwner && (
              <Button className="" disabled={!validSlug || isSubmitting} onClick={changeSlug}>
                Save
              </Button>
            )}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Body title="Workspace ID" subtitle="Used when interacting with APIs">
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded md:w-1/2">
              <span className="overflow-x-auto">{workspace?.workspaceCode}</span>
              <CopyToClipboard onCopy={copyToClipboard} text={workspace?.workspaceCode}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
    </>
  );
};

export default General;
