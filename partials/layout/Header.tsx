import React, { useState } from "react";
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
  showSearchModalAtom
} from "state";
import { prepareServerlessUrl } from "next/dist/server/base-server";

export const Header = () => {
  const [selectedProject, setSelectedProject] = useRecoilState(
    selectedProjectSelector
  );
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
  const setShare = useSetRecoilState(shareOpenAtom);
  // move into atom
  const [paneOrientation, setOrientation] = useRecoilState(orientationAtom);
  const [edit, setEdit] = useState(false);

  const router = useRouter();

  const backPresssed = () => {
    setSelectedProject(null);
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

  const handleEditProjectName = () => {
    // alert("Edit Project Name now");
    console.log("Test")
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
      className={`sticky top-0 z-30 flex justify-between items-center bg-secondary-midnight max-h-16 w-full ${
        !selectedProject ? "px-4" : "px-6"
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
      {!edit ? (
        <div onClick={handleEditProjectName} className="flex items-center group border border-transparent rounded-lg pr-2 ml-6 bg-transparent">
          <div
            className={`text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate ${
              !selectedProject ? "ml-6" : "ml-0"
            }`}
            
          >
            {selectedProject ? selectedProject.name : "My Projects"}
          </div>
        </div>
      ) : (
        <div>
          <input
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                // handleSaveProjectName();
              }
            }}
            className="ml-6 text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate border border-gray bg-transparent rounded-sm"
            // @ts-ignore
            value={selectedProject?.name || ""}
            onChange={handleChange}
          />
        </div>
      )}
      <div className="px-4 sm:px-6 lg:px-0 lg:w-5/6">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Search form */}
          {/* <SearchForm placeholder='Search GlyphX' /> */}
          {!selectedProject && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowSearchModalOpen(true);
              }}
              className="input-group  flex flex-col justify-center relative rounded-2xl border border-gray z-60"
            >
              <label htmlFor="action-search" className="sr-only">
                Search
              </label>
              <div className="flex justify-end items-center relative">
                <input
                  id="action-search"
                  className="rounded-2xl pl-9 text-white placeholder-white border-transparent w-96 bg-transparent hover:border-white"
                  type="search"
                  placeholder="Search My Projects"
                />
                <div className=" w-8 h-8 absolute pt-3">
                  <svg
                    width="17"
                    height="11"
                    viewBox="0 0 17 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.7778 10.6667H9.55558C10.0445 10.6667 10.4445 10.2667 10.4445 9.77778C10.4445 9.28889 10.0445 8.88889 9.55558 8.88889H7.7778C7.28891 8.88889 6.88891 9.28889 6.88891 9.77778C6.88891 10.2667 7.28891 10.6667 7.7778 10.6667ZM0.666687 0.888889C0.666687 1.37778 1.06669 1.77778 1.55558 1.77778H15.7778C16.2667 1.77778 16.6667 1.37778 16.6667 0.888889C16.6667 0.4 16.2667 0 15.7778 0H1.55558C1.06669 0 0.666687 0.4 0.666687 0.888889ZM4.22224 6.22222H13.1111C13.6 6.22222 14 5.82222 14 5.33333C14 4.84444 13.6 4.44444 13.1111 4.44444H4.22224C3.73335 4.44444 3.33335 4.84444 3.33335 5.33333C3.33335 5.82222 3.73335 6.22222 4.22224 6.22222Z"
                      fill="#CECECE"
                    />
                  </svg>
                </div>
                
              </div>
              <button
                className="absolute inset-0 right-auto group"
                type="submit"
                aria-label="Search"
              >
                <svg
                  className="w-4 h-4 shrink-0 fill-current text-white group-hover:text-gray ml-3 mr-2"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                  <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </button>
            </div>
          )}
          {/* Header: Right side */}
          <div className="flex justify-end w-full  items-center space-x-3 mr-6">
            {/* <Help align='right' /> */}
            {/*  Divider */}
            {/* {!selectedProject && <hr className="w-px h-6 bg-gray mx-3" />} */}
            {selectedProject && (
              <button
                className={`h-8 px-2 flex items-center justify-center bg-yellow hover:bg-gray transition duration-150 rounded-full ml-3 ${
                  showSearchModalOpen && "bg-gray"
                }`}
                onClick={(e) => {
                  // setShowAddProject(selectedProject ? true : false);
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
                    fill="#000"
                  />
                </svg>

                <b className="text-black text-xs">Share</b>
              </button>
            )}
            {selectedProject && (
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
                className={`h-8 px-2 flex items-center justify-center bg-primary-yellow hover:bg-gray transition duration-150 rounded-full ml-3 ${
                  setShowSearchModalOpen && "bg-gray"
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
            {
              !selectedProject && showSearchModalOpen && (
                <SearchModal
                  // id="search-modal"
                  // searchId="search"
                  // modalOpen={searchModalOpen}
                  // setModalOpen={setSearchModalOpen}
                />
              )
            }
            {!selectedProject &&  (                
                <GridToggle />
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
