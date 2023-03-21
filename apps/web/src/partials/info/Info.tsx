import React from "react";
import { MemberList } from "../invite/MemberList";
import {
    selectedProjectSelector,
} from "state";
import { useRecoilState } from "recoil";
import Image from 'next/image'


export const Info = ({ setInfo,setShare }) => {

    const [selectedProject, setSelectedProject] = useRecoilState(
        selectedProjectSelector
    );

    return (
        // <div className="flex flex-col absolute z-50 right-0 w-96 bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
        <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
            <div className="pt-4 pl-4 pr-4  overflow-auto">
                <div className="flex flex-row justify-between mb-2 items-center">
                    <div className="flex flex-row justify-between space-x-3">

                        <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.3775 1.5L6.8775 3H13.5V10.5H1.5V1.5H5.3775ZM6 0H1.5C0.675 0 0.00749999 0.675 0.00749999 1.5L0 10.5C0 11.325 0.675 12 1.5 12H13.5C14.325 12 15 11.325 15 10.5V3C15 2.175 14.325 1.5 13.5 1.5H7.5L6 0Z" fill="#CECECE" />
                        </svg>

                        <p className="text-light-gray text-[14px] leading-[16px] font-medium font-roboto">
                            {selectedProject ? selectedProject.name : "My Projects"}
                        </p>
                    </div>


                    <svg onClick={() => {
                        setInfo(false);
                    }} className="p-0 rounded-xl border-2 border-transparent hover:border-white hover:cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="none" />
                        <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997V5.70997Z" fill="#CECECE" />
                    </svg>
                </div>
            </div>
            <Image className="w-full h-auto" src="/images/project.png" alt="Sample Project" />
            <div className="mt-2 pl-4 pr-4">
                <p className="text-light-gray font-roboto font-medium text-[14px] leading-[16.41px]">Owner</p>
                <div className="flex flex-row justify-between items-center mt-2 ">
                    <div className="flex items-center">
                        <div
                            className="rounded-full bg-secondary-blue h-5 w-5 text-sm text-white flex items-center justify-center mr-2">
                            {`${selectedProject.author.split("@")[0][0].toUpperCase()}`}
                        </div>
                        <p className="text-light-gray font-roboto text-[10px] leading-[12px]">{selectedProject.author}</p>
                    </div>
                    <div>
                        <p className="text-gray font-roboto font-normal text-[10px] leading-[12px]">{new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 pl-4 pr-4">
                <div className="flex flex-row justify-between items-center font-roboto font-medium text-light-gray text-[14px] leading-[16px]">
                    <p>Shared with</p>
                    <div 
                    onClick={()=>{
                        setInfo(false);
                        setShare(true);
                    }}
                    className="flex flex-row item-center justify-center space-x-2 px-2 py-[0.5px] border border-transparent rounded-xl hover:border-white hover:cursor-pointer hover:bg-secondary-midnight">
                        <p>Edit</p>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.37231 4.01333L7.98556 4.62667L1.9464 10.6667H1.33315V10.0533L7.37231 4.01333ZM9.77198 0C9.60533 0 9.43202 0.0666666 9.30537 0.193333L8.08554 1.41333L10.5852 3.91333L11.805 2.69333C12.065 2.43333 12.065 2.01333 11.805 1.75333L10.2452 0.193333C10.1119 0.06 9.94529 0 9.77198 0ZM7.37231 2.12667L0 9.5V12H2.49965L9.87196 4.62667L7.37231 2.12667Z" fill="#CECECE" />
                        </svg>
                    </div>
                </div>
                <div className="mt-2 border-b-[1px] border-t-[1px] border-gray">
                <MemberList 
                    size="small"
                />
                </div>        
            </div>
            <div className="mt-4 pl-4 pr-4 font-roboto">
                <p className="text-light-gray  font-medium text-[14px] leading-[16px] border-b-[1px] border-gray pb-2">Activity</p>
                <p className="text-light-gray font-normal text-[10px] mt-2 leading-[12px]">Under Development :)</p>
            </div>
        </div>
    );
};
