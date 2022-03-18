import { useState } from "react";

import SearchModal from "../../components/ModalSearch";
import GridToggle from "../../components/GridToggle";
import Notifications from "../../components/DropdownNotifications";
import Help from "../../components/DropdownHelp";
import { PencilIcon } from "@heroicons/react/outline";
import { updateProject } from "../../graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

function Header({
  sidebarOpen,
  setSidebarOpen,
  grid,
  setProject,
  setGrid,
  project,
  setShowAddProject,
  setShare,
}) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [edit, setEdit] = useState(false);
  const handleEdit = () => {
    setEdit((prev) => !prev);
    setProjectName(project.name);
  };
  const handleChange = (e) => {
    setProjectName(e.target.value);
  };
  const handleSaveProjectName = async () => {
    const updateProjectInput = {
      id: project.id,
      name: projectName,
      // version: project._version,
    };

    try {
      const result = await API.graphql(
        graphqlOperation(updateProject, { input: updateProjectInput })
      );
 
      // setProject(result.data.updateProject);
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <header
      className={`sticky top-0 border-b border-gray-400 z-30 flex justify-between items-center bg-primary-dark-blue max-h-16 ${
        project ? "ml-0" : "mx-6"
      }`}
    >
      {!edit ? (
        <div className="flex items-center group">
          <div
            className={`text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate ${
              project ? "ml-6" : "ml-0"
            }`}
          >
            {project ? project.name : "My Projects"}
          </div>
          {project && (
            <PencilIcon
              onClick={handleEdit}
              className="hidden h-6 w-6 group-hover:flex"
            />
          )}
        </div>
      ) : (
        <div>
          <input
            onKeyPress={(ev) => {
      
              if (ev.key === "Enter") {
                ev.preventDefault();
                handleSaveProjectName();
              }
            }}
            className="ml-6 text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate border border-gray-400 bg-transparent rounded-sm"
            value={projectName}
            onChange={handleChange}
          />
        </div>
      )}
      <div className="px-4 sm:px-6 lg:px-0 lg:w-5/6">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex">
            {/* TODO: fix resizing here */}
            {/* Hamburger button */}
            {/* <button
							className='text-gray-500 hover:text-gray-600 lg:hidden'
							aria-controls='sidebar'
							aria-expanded={sidebarOpen}
							onClick={() => setSidebarOpen(!sidebarOpen)}>
							<span className='sr-only'>Open sidebar</span>
							<svg
								className='w-6 h-6 fill-current'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<rect x='4' y='5' width='16' height='2' />
								<rect x='4' y='11' width='16' height='2' />
								<rect x='4' y='17' width='16' height='2' />
							</svg>
						</button> */}
          </div>

          {/* Search form */}
          {/* <SearchForm placeholder='Search GlyphX' /> */}
          {!project && (
            <form
              onClick={(e) => {
                e.stopPropagation();
                setSearchModalOpen(true);
              }}
              className="relative bg-gray-400 bg-opacity-5 rounded-md hover:border-gray-300 hover:text-gray-600 z-60"
            >
              <label htmlFor="action-search" className="sr-only">
                Search
              </label>
              <input
                id="action-search"
                className="form-input pl-9 border-transparent w-96 bg-transparent"
                type="search"
                placeholder="Search Glyphx"
              />
              <button
                className="absolute inset-0 right-auto group"
                type="submit"
                aria-label="Search"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 fill-current text-white group-hover:text-gray-500 ml-3 mr-2"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                  <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </button>
            </form>
          )}
          {/* Header: Right side */}
          <div className="flex items-center space-x-3 mr-6">
            {/* <Help align='right' /> */}
            {/*  Divider */}
            {/* {!project && <hr className="w-px h-6 bg-gray-200 mx-3" />} */}
            {project && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 rounded-full ml-3 ${
                  searchModalOpen && "bg-gray-200"
                }`}
                onClick={(e) => {
                  // setShowAddProject(project ? true : false);
                  setShare(true);
                }}
                aria-controls="search-modal"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.63636 8.36364C10.8418 8.36364 11.8182 7.38727 11.8182 6.18182C11.8182 4.97636 10.8418 4 9.63636 4C8.43091 4 7.45455 4.97636 7.45455 6.18182C7.45455 7.38727 8.43091 8.36364 9.63636 8.36364ZM4.72727 7.27273V6.18182C4.72727 5.88182 4.48182 5.63636 4.18182 5.63636C3.88182 5.63636 3.63636 5.88182 3.63636 6.18182V7.27273H2.54545C2.24545 7.27273 2 7.51818 2 7.81818C2 8.11818 2.24545 8.36364 2.54545 8.36364H3.63636V9.45455C3.63636 9.75455 3.88182 10 4.18182 10C4.48182 10 4.72727 9.75455 4.72727 9.45455V8.36364H5.81818C6.11818 8.36364 6.36364 8.11818 6.36364 7.81818C6.36364 7.51818 6.11818 7.27273 5.81818 7.27273H4.72727ZM9.63636 9.45455C8.18 9.45455 5.27273 10.1855 5.27273 11.6364V12.1818C5.27273 12.4818 5.51818 12.7273 5.81818 12.7273H13.4545C13.7545 12.7273 14 12.4818 14 12.1818V11.6364C14 10.1855 11.0927 9.45455 9.63636 9.45455Z"
                    fill="#0D1321"
                  />
                </svg>

                <b className="text-gray-800 text-xs">Share</b>
              </button>
            )}
            {!project && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 rounded-full ml-3 ${
                  searchModalOpen && "bg-gray-200"
                }`}
                onClick={(e) => {
                  setShowAddProject(true);
                }}
                aria-controls="search-modal"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.1429 6.85714H6.85714V11.1429C6.85714 11.6143 6.47143 12 6 12C5.52857 12 5.14286 11.6143 5.14286 11.1429V6.85714H0.857143C0.385714 6.85714 0 6.47143 0 6C0 5.52857 0.385714 5.14286 0.857143 5.14286H5.14286V0.857143C5.14286 0.385714 5.52857 0 6 0C6.47143 0 6.85714 0.385714 6.85714 0.857143V5.14286H11.1429C11.6143 5.14286 12 5.52857 12 6C12 6.47143 11.6143 6.85714 11.1429 6.85714Z"
                    fill="#0D1321"
                  />
                </svg>

                <b className="text-gray-800 text-sm mx-2">New</b>
              </button>
            )}
            {!project && (
              <>
                <SearchModal
                  id="search-modal"
                  searchId="search"
                  modalOpen={searchModalOpen}
                  setModalOpen={setSearchModalOpen}
                />

                <GridToggle
                  align="right"
                  grid={grid}
                  setGrid={setGrid}
                  setProject={setProject}
                />
              </>
            )}
            {/* {project && <DeleteModel align="right" />} */}
            {project && <Help align="right" />}
            <Notifications align="right" />
            {/* {!project && (
							<button
								className='btn rounded-2xl bg-yellow-400 text-gray-800 text-xs font-bold hover:text-white py-1.5'
								onClick={signOut}>
								Sign Out
							</button>
						)} */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
