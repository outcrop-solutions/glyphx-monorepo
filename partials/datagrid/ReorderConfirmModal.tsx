import ClickAwayListener from "react-click-away-listener";
import { CheckIcon } from "@heroicons/react/outline";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { showAddProjectAtom } from "@/state/globals";
import { selectedProjectSelector } from "@/state/project";
import { propertiesAtom, showReorderConfirmAtom } from "@/state/properties";
import { filtersSelector } from "@/state/filters";
import { API, graphqlOperation, Storage } from "aws-amplify";
import { CreateProjectInput, CreateProjectMutation } from "API";
import {userAtom } from "@/state/user";
import { createProject } from "graphql/mutations";

export const ReorderConfirmModal = () => {
  const user = useRecoilValue(userAtom);
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  const setReorderConfirm = useSetRecoilState(showReorderConfirmAtom);
  const project = useRecoilValue(selectedProjectSelector);
  const properties = useRecoilValue(propertiesAtom);
  const filters = useRecoilValue(filtersSelector);
  //  FORK PROJECT
  const handleSave = async () => {
    let id = "";
    let proj = {};
    // utilities
    const createProj = async () => {
      try {
        const createProjectInput = {
          // id: newId,
          name: `${project.name} Copy`,
          description: "",
          // @ts-ignore
          author: user?.username,
          expiry: new Date().toISOString(),
          properties: properties.map((el) =>
            el.lastDroppedItem
              ? el.lastDroppedItem.key
                ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
                : ""
              : ""
          ),
            // @ts-ignore
          shared: [user.username],
        };
        const result = (await API.graphql(
          graphqlOperation(createProject, { input: createProjectInput })
        )) as {
          data: CreateProjectMutation;
        };

        return {
          projId: result.data.createProject.id,
          projectData: result.data.createProject,
        };
      } catch (error) {
        console.log({ error });
      }
    };
    const copyFiles = async (id) => {
      try {
        const data = await Storage.list(`${project.id}/input/`);
        for (let i = 0; i < data.length; i++) {
          const copied = await Storage.copy(
            { key: `${data[i].key}` },
            { key: `${id}${data[i].key.slice(36)}` }
          );
          return copied;
        }
      } catch (error) {
        console.log({ error });
      }
    };

    const callETL = async () => {
      if (
        project &&
        window &&
        // @ts-ignore
        //window.core &&
        properties &&
        properties.length >= 3
      ) {
        // call ETl endpoint
        let response = await fetch("https://api.glyphx.co/etl/model", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            model_id: project.id,
            x_axis: properties[0].lastDroppedItem.key,
            y_axis: properties[1].lastDroppedItem.key,
            z_axis: properties[2].lastDroppedItem.key,
            filters: filters,
          }),
        });
        let res = await response.json();
        // await updateProjectState(res);
      }
    };

    let { projId } = await createProj();
    let isCopied = await copyFiles(projId);
    if (isCopied) {
      await callETL();
    }

    // copy S3 files
    // call ETL
    // create new project with updated properties
    // set project state
    setReorderConfirm(false);
  };

  const handleClickAway = () => {
    setShowAddProject(false);
  };
  const handleCancel = () => {
    // TODO: restore properties array to old props using atom effect keying off trigger
    setReorderConfirm(false);
  };
  return (
    <div className="absolute w-full h-full flex justify-center items-center bg-gray bg-opacity-50 z-60">
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className="inline-block align-bottom bg-primary-dark-blue rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white">
              <CheckIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-white">
                New Model?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-300">
                  Reordering you properties will invalidate your saved states{" "}
                  <br /> Would you like to create a new model instead?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow text-base font-medium text-gray hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              onClick={handleSave}
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
