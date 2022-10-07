import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SearchModal, GridToggle, DropdownNotifications, Help } from "partials";
import { PencilIcon } from "@heroicons/react/outline";

import { updateProject } from "graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import { Project } from "API";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  orientationAtom,
  selectedProjectSelector,
  shareOpenAtom,
  showAddProjectAtom,
  showSearchModalAtom,
  showInfoAtom,
  payloadSelector,
  propertiesAtom
} from "state";
export const Header = () => {
  const [selectedProject, setSelectedProject] = useRecoilState(
    selectedProjectSelector
  );
  // console.log({selectedProject})
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
  const setShare = useSetRecoilState(shareOpenAtom);
  const setShowInfo = useSetRecoilState(showInfoAtom);
  const [paneOrientation, setOrientation] = useRecoilState(orientationAtom);
  const payload = useRecoilValue(payloadSelector);
  const setProperties = useSetRecoilState(propertiesAtom);

  const router = useRouter();

  

  const backPresssed = () => {
    setSelectedProject(null);
    setShare(false);
    setShowInfo(false);
    setShowSearchModalOpen(false);
    setProperties([ // TODO: THIS IS A TEMPORARY FIX, BUT NEED TO FIGURE OUT A MORE EFFICIENT WAY OF RESETING PROPERTIES
      { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    ]);
    router.push("/");
  };

  const handleChange = (e) => {
    setSelectedProject((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePaneSwitch = () => {
    if (paneOrientation === "horizontal") {
      setOrientation("vertical");
    } else {
      setOrientation("horizontal");
    }
  };

  /**
   * Changes name to what the selected project name is
   * @param e 
   */
  const handleEditProjectName = async (e) => {
    // update project info on dynamoDB
    const updateProjectInput = {
      id: selectedProject.id,
      name: e.target.value.trim(),
      description: selectedProject.description,
      shared: selectedProject.shared,
    }; 
    try {
      const result = await API.graphql(
        graphqlOperation(updateProject, { input: updateProjectInput })
      );
    } catch (error) {
      console.log({ error });
    }
  

  }

  // const handleEdit = () => {
  //   setEdit((prev) => !prev);
  //   setProjectName(selectedProject.name);
  // };
  // const handleChange = (e) => {
  //   setProjectName(e.target.value);
  // };
  // const handleSaveProjectName = async () => {
  //   const updateProjectInput = {
  //     id: selectedProject.id,
  //     name: selectedProjectName,
  //     // version: selectedProject._version,
  //   };

  //   try {
  //     const result = await API.graphql(
  //       graphqlOperation(updateProject, { input: updateProjectInput })
  //     );

  //     // setProject(result.data.updateProject);
  //   } catch (error) {
  //     console.log({ error });
  //   }
  // };
  
  return (
    <div
      className={`sticky top-0 z-30 flex justify-between items-center bg-secondary-space-blue border-l border-gray max-h-16 w-full ${!selectedProject ? "px-4" : "px-6"
        }`}
    >
      {selectedProject && (
        <button
          onClick={backPresssed}
          className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 hover:border-white"
        >
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.70998 9.88001L2.82998 6.00001L6.70998 2.12001C7.09998 1.73001 7.09998 1.10001 6.70998 0.710011C6.31998 0.320011 5.68998 0.320011 5.29998 0.710011L0.70998 5.30001C0.31998 5.69001 0.31998 6.32001 0.70998 6.71001L5.29998 11.3C5.68998 11.69 6.31998 11.69 6.70998 11.3C7.08998 10.91 7.09998 10.27 6.70998 9.88001Z"
              fill="#CECECE"
            />
          </svg>
          <span className="text-white font-medium text-sm ml-2">Back</span>
        </button>
      )}
      {/* if there is a selected project, name should be the project name */}
      {
        !selectedProject ? (
          <div className="flex items-center group border border-transparent rounded-lg pr-2 ml-6 bg-transparent">
            <div
              className={`text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate ${!selectedProject ? "ml-6" : "ml-0"
                }`}

            >
              {selectedProject ? selectedProject.name : "My Project"}
            </div>
          </div>
        ) :
          <input
            // group
            className="pl-2 text-white font-extralight text-2xl flex items-center outline-none border-2 border-transparent rounded-lg pr-2 ml-6 bg-transparent hover:border-yellow"
            defaultValue={selectedProject ? selectedProject.name : "My Projects"}
            onChange={handleEditProjectName}
          />
      }
      <div className="px-4 sm:px-6 lg:px-0 lg:w-5/6">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Search form */}
          {/* <SearchForm placeholder='Search GlyphX' /> */}
          {!selectedProject && (
            <SearchModal />
          )}
          {/* Header: Right side */}
          <div className="flex justify-end w-full  items-center space-x-2 mr-6">
            {/* <Help align='right' /> */}
            {/*  Divider */}
            {/* {!selectedProject && <hr className="w-px h-6 bg-gray mx-3" />} */}
            {selectedProject && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-yellow hover:bg-gray transition duration-150 rounded-full ml-3 ${showSearchModalOpen && "bg-gray"
                  }`}
                onClick={(e) => {
                  // setShowAddProject(selectedProject ? true : false);
                  setShowInfo(false);
                  setShare(true);
                }}
                aria-controls="share-modal"
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
                    fill="#000"
                  />
                </svg>

                <b className="text-black text-xs">Share</b>
              </button>
            )}
            {selectedProject && payload.sdt && (
              <button
                className="h-8 px-2 flex items-center justify-center rounded-lg hover:bg-gray"
                onClick={handlePaneSwitch}
              >
                {paneOrientation === "horizontal" ? (
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.888889 8.57143H6.22222C6.71111 8.57143 7.11111 8.18571 7.11111 7.71429C7.11111 7.24286 6.71111 6.85714 6.22222 6.85714H0.888889C0.4 6.85714 0 7.24286 0 7.71429C0 8.18571 0.4 8.57143 0.888889 8.57143ZM0.888889 12H6.22222C6.71111 12 7.11111 11.6143 7.11111 11.1429C7.11111 10.6714 6.71111 10.2857 6.22222 10.2857H0.888889C0.4 10.2857 0 10.6714 0 11.1429C0 11.6143 0.4 12 0.888889 12ZM0.888889 5.14286H6.22222C6.71111 5.14286 7.11111 4.75714 7.11111 4.28571C7.11111 3.81429 6.71111 3.42857 6.22222 3.42857H0.888889C0.4 3.42857 0 3.81429 0 4.28571C0 4.75714 0.4 5.14286 0.888889 5.14286ZM0 0.857143C0 1.32857 0.4 1.71429 0.888889 1.71429H6.22222C6.71111 1.71429 7.11111 1.32857 7.11111 0.857143C7.11111 0.385714 6.71111 0 6.22222 0H0.888889C0.4 0 0 0.385714 0 0.857143ZM9.77778 0H15.1111C15.6 0 16 0.385714 16 0.857143V11.1429C16 11.6143 15.6 12 15.1111 12H9.77778C9.28889 12 8.88889 11.6143 8.88889 11.1429V0.857143C8.88889 0.385714 9.28889 0 9.77778 0Z"
                      fill="#CECECE"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.888889 12H15.1111C15.6 12 16 11.6143 16 11.1429V7.71429C16 7.24286 15.6 6.85714 15.1111 6.85714H0.888889C0.4 6.85714 0 7.24286 0 7.71429V11.1429C0 11.6143 0.4 12 0.888889 12ZM0.888889 5.14286H15.1111C15.6 5.14286 16 4.75714 16 4.28571C16 3.81429 15.6 3.42857 15.1111 3.42857H0.888889C0.4 3.42857 0 3.81429 0 4.28571C0 4.75714 0.4 5.14286 0.888889 5.14286ZM0 0.857143C0 1.32857 0.4 1.71429 0.888889 1.71429H15.1111C15.6 1.71429 16 1.32857 16 0.857143C16 0.385714 15.6 0 15.1111 0H0.888889C0.4 0 0 0.385714 0 0.857143Z"
                      fill="#CECECE"
                    />
                  </svg>
                )}
              </button>
            )}
            {!selectedProject && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-primary-yellow hover:bg-gray transition duration-150 rounded-full ml-3 ${setShowSearchModalOpen && "bg-gray"
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
                    fill="#000"
                  />
                </svg>

                <b className="text-black text-sm mx-2">New Model</b>
              </button>
            )}
            {/* {
              !selectedProject && showSearchModalOpen && (
                <SearchModal
                  // id="search-modal"
                  // searchId="search"
                  // modalOpen={searchModalOpen}
                  // setModalOpen={setSearchModalOpen}
                />
              )
            } */}
            {!selectedProject && (
              <GridToggle />
            )}
            {selectedProject && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-full ml-3`}
                onClick={(e) => {
                  // setShowAddProject(selectedProject ? true : false);
                  setShare(false);
                  setShowInfo(true);
                }}
                aria-controls="info-modal"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.2 4H8.8V5.6H7.2V4ZM7.2 7.2H8.8V12H7.2V7.2ZM8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8 14.4C4.472 14.4 1.6 11.528 1.6 8C1.6 4.472 4.472 1.6 8 1.6C11.528 1.6 14.4 4.472 14.4 8C14.4 11.528 11.528 14.4 8 14.4Z" fill="white" />
                </svg>
              </button>
            )}
            {/* {selectedProject && <DeleteModel align="right" />} */}
            {/* Below is causing empty user bubble */}
            {/* {selectedProject && <Help />} */}
            <DropdownNotifications align="right" />
            {/* {!selectedProject && (
							<button
								className='btn rounded-2xl bg-yellow text-gray text-xs font-bold hover:text-white py-1.5'
								onClick={signOut}>
								Sign Out
							</button>
						)} */}
          </div>
        </div>
      </div>
    </div>
  );
};
