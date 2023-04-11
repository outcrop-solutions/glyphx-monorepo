import { useState } from 'react';
import { useRouter } from 'next/router';

import Button from 'components/Button/index';
import Modal from 'components/Modal/index';
import Card from 'components/Card/index';
import Content from 'components/Content/index';
import { _deleteWorkspace, api, useWorkspace } from 'lib/client';

const Advanced = ({ isCreator }) => {
  const router = useRouter();
  const { setWorkspace, workspace } = useWorkspace();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalState] = useState(false);
  const [verifyWorkspace, setVerifyWorkspace] = useState('');
  const verifiedWorkspace = verifyWorkspace === workspace?.slug;

  // local state
  const handleVerifyWorkspaceChange = (event) => setVerifyWorkspace(event.target.value);
  const toggleModal = () => {
    setVerifyWorkspace('');
    setModalState(!showModal);
  };

  // mutations
  const deleteWorkspace = () => {
    api({
      ..._deleteWorkspace(workspace.slug),
      setLoading: setSubmittingState,

      onSuccess: () => {
        toggleModal();
        setWorkspace(null);
        router.replace('/account');
      },
    });
  };

  return (
    <>
      <Content.Title title="Advanced Workspace Settings" subtitle="Manage your workspace settings" />
      <Content.Divider />
      <Content.Container>
        <Card danger>
          <Card.Body
            title="Delete Workspace"
            subtitle="The workspace will be permanently deleted, including its contents and domains. This action is irreversible and can not be undone."
          />
          <Card.Footer>
            <small className={`${isCreator && 'text-red-600'}`}>
              {isCreator
                ? 'This action is not reversible. Please be certain.'
                : 'Please contact your team creator for the deletion of your workspace.'}
            </small>
            {isCreator && (
              <Button className="text-white bg-red-600 hover:bg-red-500" disabled={isSubmitting} onClick={toggleModal}>
                {isSubmitting ? 'Deleting' : 'Delete'}
              </Button>
            )}
          </Card.Footer>
          <Modal show={showModal} title="Deactivate Workspace" toggle={toggleModal}>
            <p className="flex flex-col">
              <span>Your workspace will be deleted, along with all of its contents.</span>
              <span>Data associated with this workspace can&apos;t be accessed by team members.</span>
            </p>
            <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
              <strong>Warning:</strong> This action is not reversible. Please be certain.
            </p>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400">
                Enter <strong>{workspace?.slug}</strong> to continue:
              </label>
              <input
                className="px-3 py-2 border rounded"
                disabled={isSubmitting}
                onChange={handleVerifyWorkspaceChange}
                type="email"
                value={verifyWorkspace}
              />
            </div>
            <div className="flex flex-col items-stretch">
              <Button
                className="text-white bg-red-600 hover:bg-red-500"
                disabled={!verifiedWorkspace || isSubmitting}
                onClick={deleteWorkspace}
              >
                <span>Delete Workspace</span>
              </Button>
            </div>
          </Modal>
        </Card>
      </Content.Container>
    </>
  );
};

export default Advanced;
