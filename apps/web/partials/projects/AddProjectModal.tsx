import React, { useState } from "react";

import ClickAwayListener from "react-click-away-listener";
import {
  PlusIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  UploadIcon,
} from "@heroicons/react/outline";




import { useRecoilValue, useSetRecoilState } from "recoil";
import { projectsAtom, showAddProjectAtom } from "@/state/globals";


import { LinkDropDown, MemberList } from "../invite";
import { PermissionsDropDown } from "../invite";
import { NewProject } from "./AddProjectContent";
import ImportProject from "./AddProjectContent/ImportProject";
import TemplateLibrary from "./AddProjectContent/TemplateLibrary";

export const AddProjectModal = () => {
  
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  const setProjects = useSetRecoilState(projectsAtom);

  const [current, setCurrent] = useState(0);
  

  // const handleChip = () => {
  //   setChips((prev) => {
  //     setMembers("");
  //     return [...prev, members];
  //   });
  // };

  // const handleDelete = (item) => {
  //   setChips((prev) => {
  //     let newChips = [...prev].filter((el) => el !== item);
  //     return newChips;
  //   });
  // };

  
  const handleClickAway = () => {
    setShowAddProject(false);
  };

  return (
    <div className="absolute w-full h-full flex justify-center items-center bg-gray bg-opacity-50 z-60">
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className="rounded-lg flex flex-row w-[928px] h-[506px] bg-secondary-midnight z-60">
          <div className="flex flex-col rounded-l-lg bg-secondary-space-blue w-[240px]">
            <div onClick={handleClickAway} className="group flex flex-row items-center mt-4 mx-2 p-1 border border-transparent hover:cursor-pointer hover:border-light-gray hover:bg-secondary-midnight">
              <svg className="group-hover:fill-white fill-light-gray" width="24" height="24" viewBox="0 0 24 24" >
                <path d="M14.71 15.88L10.83 12L14.71 8.12C15.1 7.73 15.1 7.1 14.71 6.71C14.32 6.32 13.69 6.32 13.3 6.71L8.70998 11.3C8.31998 11.69 8.31998 12.32 8.70998 12.71L13.3 17.3C13.69 17.69 14.32 17.69 14.71 17.3C15.09 16.91 15.1 16.27 14.71 15.88Z" />
              </svg>

              <p className=" font-roboto font-medium text-[14px] leading-[16px] text-light-gray group-hover:text-white">Back to Dashboard</p>
            </div>
            <hr
              className="mx-2 text-light-gray mt-1"
            />
            <div className="mt-5 mx-4 space-y-3 font-roboto font-medium text-[14px] leading-[16px] text-light-gray">
              <div onClick={()=>{setCurrent(0)}} className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white">
                <svg className="group-hover:fill-white fill-light-gray text-white" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z" />
                </svg>

                <p>New Project</p>
              </div>
              <div onClick={()=>{setCurrent(1)}} className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white">
                <svg className="group-hover:fill-white fill-light-gray text-white" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.9 11.0267C16.4467 8.72667 14.4267 7 12 7C10.0733 7 8.4 8.09333 7.56667 9.69333C5.56 9.90667 4 11.6067 4 13.6667C4 15.8733 5.79333 17.6667 8 17.6667H16.6667C18.5067 17.6667 20 16.1733 20 14.3333C20 12.5733 18.6333 11.1467 16.9 11.0267ZM16.6667 16.3333H8C6.52667 16.3333 5.33333 15.14 5.33333 13.6667C5.33333 12.3 6.35333 11.16 7.70667 11.02L8.42 10.9467L8.75333 10.3133C9.38667 9.09333 10.6267 8.33333 12 8.33333C13.7467 8.33333 15.2533 9.57333 15.5933 11.2867L15.7933 12.2867L16.8133 12.36C17.8533 12.4267 18.6667 13.3 18.6667 14.3333C18.6667 15.4333 17.7667 16.3333 16.6667 16.3333ZM9.33333 13H11.0333V15H12.9667V13H14.6667L12 10.3333L9.33333 13Z" />
                </svg>

                <p>Import Project</p>
              </div>
              <div onClick={()=>{setCurrent(2)}} className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white">
                <svg className="group-hover:fill-white fill-light-gray text-white" width="24" height="24" viewBox="0 0 24 24" >
                  <path d="M16.0055 6C14.5866 6 13.0587 6.29104 12.0036 7.09141C10.9486 6.29104 9.42065 6 8.00182 6C6.94679 6 5.82628 6.16007 4.88768 6.57481C4.35653 6.81492 4 7.33151 4 7.92087V16.1282C4 17.0741 4.88768 17.7726 5.80446 17.5398C6.51751 17.3579 7.27422 17.2779 8.00182 17.2779C9.13688 17.2779 10.3447 17.467 11.3197 17.9472C11.7563 18.1655 12.251 18.1655 12.6803 17.9472C13.6553 17.4598 14.8631 17.2779 15.9982 17.2779C16.7258 17.2779 17.4825 17.3579 18.1955 17.5398C19.1123 17.7799 20 17.0814 20 16.1282V7.92087C20 7.33151 19.6435 6.81492 19.1123 6.57481C18.181 6.16007 17.0605 6 16.0055 6ZM18.5521 15.2624C18.5521 15.7208 18.1301 16.0555 17.6789 15.9754C17.1332 15.8736 16.5657 15.8299 16.0055 15.8299C14.7685 15.8299 12.9859 16.3029 12.0036 16.9213V8.54661C12.9859 7.92815 14.7685 7.45521 16.0055 7.45521C16.6749 7.45521 17.337 7.52069 17.97 7.65894C18.3047 7.7317 18.5521 8.03001 18.5521 8.37199V15.2624Z" />
                </svg>


                <p>Template Library</p>
              </div>
            </div>
          </div>

          {
            current === 0 ?  
            <NewProject exit={handleClickAway}/>
            :
            <></>
          }
          {
            current === 1 ?
            <ImportProject exit={handleClickAway}/>
            :
            <></>
          }
          {
            current === 2 ?
            <TemplateLibrary exit={handleClickAway}/>
            :
            <></>
          }
          

        </div>
      </ClickAwayListener>
    </div>
  );
};
