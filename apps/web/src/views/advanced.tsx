import Button from 'components/Button/index';
import Card from 'components/Card/index';
import Content from 'components/Content/index';

import { _deleteWorkspace } from 'lib/client';
import useIsTeamOwner from 'lib/client/hooks/useIsOwner';
import { showModalAtom } from 'state';
import { useRecoilState } from 'recoil';
import produce from 'immer';

const Advanced = () => {
  const isCreator = useIsTeamOwner();
  const [deleteModal, setDeleteModal] = useRecoilState(showModalAtom);

  const handleDeleteWorkspace = () => {
    setDeleteModal(
      produce((draft) => {
        draft.type = 'deleteWorkspace';
      })
    );
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
              <Button
                className="text-white bg-red-600 hover:bg-red-500"
                disabled={deleteModal.isSubmitting}
                onClick={() => handleDeleteWorkspace()}
              >
                {deleteModal.isSubmitting ? 'Deleting' : 'Delete'}
              </Button>
            )}
          </Card.Footer>
        </Card>
      </Content.Container>
    </>
  );
};

export default Advanced;
