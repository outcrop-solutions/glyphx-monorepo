import ClickAwayListener from 'react-click-away-listener';
import { CheckIcon } from '@heroicons/react/outline';
import { useSetRecoilState } from 'recoil';
import { showAddProjectAtom } from 'state/ui';
import { forkProject } from 'lib/client';
export const ReorderConfirmModal = () => {
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);

  const handleClickAway = () => {
    setShowAddProject(false);
  };
  const handleCancel = () => {
    // TODO: restore properties array to old props using atom effect keying off trigger
    // setReorderConfirm(false);
  };
  return (
    <div className="absolute w-full h-full flex justify-center items-center bg-gray bg-opacity-50 z-60">
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className="inline-block align-bottom bg-primary-dark-blue rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full">
              <CheckIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-white">New Model?</h3>
              <div className="mt-2">
                <p className="text-sm text-slate-300">
                  Reordering you properties will invalidate your saved states <br /> Would you like to create a new
                  model instead?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow text-base font-medium text-gray hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              onClick={forkProject}
            >
              Create New Model
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-gray text-base font-medium text-gray hover:bg-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
};
