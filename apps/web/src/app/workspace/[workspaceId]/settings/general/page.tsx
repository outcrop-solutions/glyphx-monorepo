'use client';
import {useEffect, useState, useTransition} from 'react';
import {DocumentDuplicateIcon} from '@heroicons/react/outline';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isSlug from 'validator/lib/isSlug';
import Button from 'app/_components/Button';
import Card from 'app/_components/Card';
import Content from 'app/_components/Content';
import useIsTeamOwner from 'lib/client/hooks/useIsOwner';
import {updateWorkspaceName, updateWorkspaceSlug} from 'actions';
import {workspaceAtom} from 'state';
import {useRecoilValue} from 'recoil';

const General = () => {
  const workspace = useRecoilValue(workspaceAtom);
  const [isPending, startTransition] = useTransition();
  const {data: ownership} = useIsTeamOwner();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState(workspace?.name || '');
  const [slug, setSlug] = useState(workspace?.slug || '');

  const validName = name?.length > 0 && name?.length <= 16;
  const validSlug =
    slug?.length > 0 && slug?.length <= 16 && isSlug(slug) && isAlphanumeric(slug, undefined, {ignore: '-'});

  // local state
  const copyToClipboard = () => toast.success('Copied to clipboard!');
  const handleNameChange = (event) => setName(event.target.value);
  const handleSlugChange = (event) => setSlug(event.target.value);

  useEffect(() => {
    if (workspace) {
      setName(workspace?.name);
      setSlug(workspace.slug!);
    }
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
              <Button
                className="bg-primary-yellow"
                disabled={!validName || isSubmitting}
                onClick={() =>
                  // @ts-ignore
                  startTransition(async () => {
                    await updateWorkspaceName(workspace.id as string, name);
                  })
                }
              >
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
              <Button
                className=""
                disabled={!validSlug || isSubmitting}
                onClick={async () =>
                  startTransition(async () => {
                    await updateWorkspaceSlug(workspace.id as string, slug);
                  })
                }
              >
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
