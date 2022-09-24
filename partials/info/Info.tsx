import React from "react";
import {
    selectedProjectSelector,
  } from "state";
  import { useRecoilState } from "recoil";


export const Info = ({ setInfo }) => {

    const [selectedProject, setSelectedProject] = useRecoilState(
        selectedProjectSelector
      );

    return (
        <div className="flex flex-col absolute z-50 right-0  w-67 bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
            <div className="pt-4 pl-4 pr-4">
                <div className="flex flex-row justify-between mb-2">
                    <div className="flex flex-row justify-between space-x-3">
                    <svg className="mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.3775 7.5L11.8775 9H18.5V16.5H6.5V7.5H10.3775ZM11 6H6.5C5.675 6 5.0075 6.675 5.0075 7.5L5 16.5C5 17.325 5.675 18 6.5 18H18.5C19.325 18 20 17.325 20 16.5V9C20 8.175 19.325 7.5 18.5 7.5H12.5L11 6Z" fill="white" />
                            </svg>
                            <p className="text-light-gray text-lg">
                            {selectedProject ? selectedProject.name : "My Projects"}
                    </p>
                    </div>
                    
                    <svg
                        onClick={() => {
                            setInfo(false);
                        }}
                        className="w-6 h-6 rounded-xl p-1 border-2 border-transparent hover:border-white hover:cursor-pointer hover:text-yellow"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M13.3 0.709971C12.91 0.319971 12.28 0.319971 11.89 0.709971L6.99997 5.58997L2.10997 0.699971C1.71997 0.309971 1.08997 0.309971 0.699971 0.699971C0.309971 1.08997 0.309971 1.71997 0.699971 2.10997L5.58997 6.99997L0.699971 11.89C0.309971 12.28 0.309971 12.91 0.699971 13.3C1.08997 13.69 1.71997 13.69 2.10997 13.3L6.99997 8.40997L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L8.40997 6.99997L13.3 2.10997C13.68 1.72997 13.68 1.08997 13.3 0.709971Z"
                            fill="#CECECE"
                        />
                    </svg>
                </div>
                

            </div>
            <img className="w-64 h-auto" src="../images/project.png" alt="sample" />
            <div>
                <p className="text-white">Owner</p>
            </div>
            <div>
                <p className="text-white">Shared with</p>
            </div>
            <div>
                <p className="text-white">Activity</p>
            </div>
        </div>
    );
};
