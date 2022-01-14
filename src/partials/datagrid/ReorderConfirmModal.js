import { useState } from "react";

import ClickAwayListener from "react-click-away-listener";
import { CheckIcon } from "@heroicons/react/outline";
import { v4 as uuid } from "uuid";
import { createProject } from "../../graphql/mutations";
import { API, graphqlOperation, Storage } from "aws-amplify";

export const ReorderConfirmModal = ({
  user,
  project,
  setShowAddProject,
  setProject,
  setDataGrid,
  setSelectedFile,
  setFilesOpen,
  setFileSystem,
  setReorderConfirm,
}) => {
  const [current, setCurrent] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectFile, setProjectFile] = useState("");

  const handleSave = async () => {
    let newId = uuid();
    const createProjectInput = {
      id: newId,
      name: `${project.name} Copy`,
      description: "",
      author: user.id,
    };

    try {
      const data = await Storage.list(`${project.id}/input/`);
      console.log({ data });
      for (let i = 0; i < data.length; i++) {
        console.log({
          strings: [
            { srckey: `${data[i].key}` },
            { destkey: `${newId}${data[i].key.slice(36)}` },
          ],
        });
        const copied = await Storage.copy(
          { key: `${data[i].key}` },
          { key: `${newId}${data[i].key.slice(36)}` }
        );
        console.log({ copied });
      }
      console.log({ createProjectInput });
      const result = await API.graphql(
        graphqlOperation(createProject, { input: createProjectInput })
      );
      console.log({ result });
      setReorderConfirm(false);
      setProject(result.data.createProject);
      // fetchProjects();
    } catch (error) {
      console.log({ error });
    }
  };

  const handleClickAway = () => {
    setShowAddProject(false);
  };
  const handleCancel = () => {};
  return (
    <div className="absolute w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-60">
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
                <p className="text-sm text-gray-300">
                  Reordering you properties will invalidate your saved states{" "}
                  <br /> Would you like to create a new model instead?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-400 text-base font-medium text-gray-900 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              onClick={handleSave}
            >
              Create New Model
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setReorderConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
};

// {menu ? (
// 	<div className='w-full flex justify-between space-x-4'>
// 		<div
// 			onClick={() => toggleMenu('file')}
// 			className='btn select-none cursor-pointer bg-yellow-600 rounded-md py-1 hover:bg-yellow-400 text-white'>
// 			Add from project file
// 		</div>
// 		<div
// 			onClick={() => toggleMenu('manual')}
// 			className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
// 			Add Manually
// 		</div>
// 	</div>
// ) : null}

// {!menu ? (
// 	<>
// 		{view === 'file' ? (
// 			<div className='p-4 bg-gray-800 w-max rounded-lg -m-10'>
// 				<div className='file_upload p-5 relative w-80 border-4 border-dotted border-gray-300 rounded-lg'>
// 					<svg
// 						className='text-white w-24 mx-auto mb-4'
// 						fill='none'
// 						viewBox='0 0 24 24'
// 						stroke='currentColor'>
// 						<path
// 							strokeLinecap='round'
// 							strokeLinejoin='round'
// 							strokeWidth='2'
// 							d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
// 						/>
// 					</svg>
// 					<div className='input_field flex flex-col w-max mx-auto text-center'>
// 						<label className='mb-4'>
// 							<input
// 								className='text-sm cursor-pointer w-36 hidden'
// 								type='file'
// 								multiple
// 							/>
// 							<div className='bg-yellow-400 text-gray-800 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-yellow-600'>
// 								Select
// 							</div>
// 						</label>
// 						<div className='title text-white uppercase'>
// 							or drop files here
// 						</div>
// 					</div>
// 					<div
// 						onClick={() => setShowAddProject(false)}
// 						className='absolute -top-10 -right-10 bg-gray-700 p-4 cursor-pointer hover:bg-gray-100 py-2 text-white hover:text-gray-900 rounded-full'>
// 						X
// 					</div>
// 				</div>
// 			</div>
// 		) : (
// 			<>
// 				<h1 className='text-xl text-white font-bold mb-6'>
// 					Add a new project
// 				</h1>
// 				{/* Form */}
// 				<div
// 					onKeyPress={(ev) => {
// 						if (ev.key === 'Enter') {
// 							ev.preventDefault()
// 							handleSave()
// 						}
// 					}}>
// 					<div className='space-y-4'>
// 						<div>
// 							<label className='block text-sm font-medium mb-1 text-white'>
// 								Name
// 							</label>
// 							<input
// 								id='name'
// 								value={projectData.name}
// 								onChange={(e) =>
// 									setProjectData({
// 										...projectData,
// 										name: e.target.value,
// 									})
// 								}
// 								className='form-input w-full bg-primary-dark-blue border-gray-400 text-white focus:border-0'
// 							/>
// 						</div>
// 						<div>
// 							<label className='block text-sm font-medium mb-1 text-white'>
// 								Description
// 							</label>
// 							<input
// 								value={projectData.description}
// 								onChange={(e) =>
// 									setProjectData({
// 										...projectData,
// 										description: e.target.value,
// 									})
// 								}
// 								id='description'
// 								className='form-input w-full bg-primary-dark-blue border-gray-400 focus:border-opacity-0 focus:ring-transparent text-white'
// 							/>
// 						</div>
// 					</div>
// 					<label className='block text-sm font-medium my-3 text-white'>
// 						States
// 					</label>
// 					<div className='flex justify-start items-center mt-6'>
// 						<div className='mr-2'>
// 							<div className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
// 								Link to an existing State
// 							</div>
// 						</div>
// 						<div
// 							className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'
// 							to='/'>
// 							Create & link to a new State
// 						</div>
// 					</div>
// 					<label className='block text-sm font-medium my-3 text-white'>
// 						Filters
// 					</label>
// 					<div className='flex justify-start items-center mt-6'>
// 						<div className='mr-2'>
// 							<div className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
// 								Link to an existing Filter
// 							</div>
// 						</div>
// 						<div
// 							className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'
// 							to='/'>
// 							Create & link to a new Filter
// 						</div>
// 					</div>
// 					<div className='flex items-center justify-between mt-6'>
// 						<div className='mr-1'>
// 							<div
// 								onClick={() => setMenu(true)}
// 								className='text-sm underline hover:no-underline text-gray-400'>
// 								Cancel
// 							</div>
// 						</div>
// 						<div
// 							onClick={handleSave}
// 							className='btn bg-yellow-400 select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow-600 text-gray-900 ml-3'
// 							to='/'>
// 							Save
// 						</div>
// 					</div>
// 				</div>
// 			</>
// 		)}
// 	</>
// ) : null}
