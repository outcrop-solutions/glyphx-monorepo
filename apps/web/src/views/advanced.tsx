import Button from 'components/Button/index';
import Card from 'components/Card/index';
import Content from 'components/Content/index';
import { web as webTypes } from '@glyphx/types';
import { _deleteWorkspace } from 'lib/client';
import useIsTeamOwner from 'lib/client/hooks/useIsOwner';
import { modalsAtom } from 'state';
import { useRecoilState } from 'recoil';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

const Advanced = () => {
  const isCreator = useIsTeamOwner();
  const [modals, setModals] = useRecoilState(modalsAtom);

  const handleDeleteWorkspace = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_WORKSPACE,
          isSubmitting: false,
          data: {},
        });
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
                disabled={modals[0]?.isSubmitting}
                onClick={() => handleDeleteWorkspace()}
              >
                {modals[0]?.isSubmitting ? 'Deleting' : 'Delete'}
              </Button>
            )}
          </Card.Footer>
        </Card>
      </Content.Container>
    </>
  );
};

export default Advanced;
