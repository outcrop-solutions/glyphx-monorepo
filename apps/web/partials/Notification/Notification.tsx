import React,{useEffect} from "react";
import { MemberList } from "../invite/MemberList";
import {
    selectedProjectSelector,
} from "state";
import { useRecoilState } from "recoil";


export const Notification = ({ setNotif }) => {

    const [selectedProject, setSelectedProject] = useRecoilState(
        selectedProjectSelector
    );

    useEffect(() => {
        console.log({selectedProject})
    }, [selectedProject])
    

    return (
        // <div className="flex flex-col absolute z-50 right-0 w-96 bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
        <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
            
            <div className="pt-4 pl-4 pr-4">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center justify-between space-x-3">
                    <svg className="mt-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.7658 16.1354L16.7455 15.0769V10.9744C16.7455 8.45538 15.4485 6.34667 13.1865 5.78872V5.23077C13.1865 4.54974 12.6566 4 12.0001 4C11.3437 4 10.8138 4.54974 10.8138 5.23077V5.78872C8.54391 6.34667 7.25474 8.44718 7.25474 10.9744V15.0769L6.23448 16.1354C5.73622 16.6523 6.08421 17.5385 6.78811 17.5385H17.2042C17.9161 17.5385 18.2641 16.6523 17.7658 16.1354ZM15.1637 15.8974H8.83654V10.9744C8.83654 8.93949 10.0308 7.28205 12.0001 7.28205C13.9695 7.28205 15.1637 8.93949 15.1637 10.9744V15.8974ZM12.0001 20C12.8701 20 13.5819 19.2615 13.5819 18.359H10.4183C10.4183 19.2615 11.1222 20 12.0001 20Z" fill="white"/>
</svg>
                        <p className="font-roboto font-medium text-light-gray text-[14px] leading-[16px]">
                            Notifications
                        </p>
                    </div>

                    <svg onClick={() => {
                        setNotif(false);
                    }} className="p-0 rounded-xl border-2 border-transparent hover:border-white hover:cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="none" />
                        <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997V5.70997Z" fill="#CECECE" />
                    </svg>
                </div>

                <div className="mt-4 border-t-[1px] border-t-gray">
                        <p className="font-roboto font-normal text-[10px] leading-[12px] text-gray mt-2">{new Date(selectedProject.createdAt).toLocaleDateString()} {new Date(selectedProject.createdAt).toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}</p>
                        <div className="flex flex-row mt-2">
                        <div className="flex items-center">
                        <div
                            className=" relative rounded-full bg-cyan h-5 w-5 text-sm text-white flex items-center justify-center mr-2">
                            {`${selectedProject.author.split("@")[0][0].toUpperCase()}`}
                            <div className="rounded-full absolute top-[2px] right-[1px] bg-primary-yellow h-1 w-1"/>
                        </div>
                        
                    </div>
                            <p className="font-roboto font-bold text-[12px] leading-[14px] text-light-gray">{selectedProject.author} <span className="font-normal">created the project</span>.</p>
                        </div>
                </div>


            </div>
            
        </div>
    );
};
