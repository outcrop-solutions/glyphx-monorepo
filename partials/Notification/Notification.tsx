import React from "react";
import { MemberList } from "../invite/MemberList";
import {
    selectedProjectSelector,
} from "state";
import { useRecoilState } from "recoil";


export const Notification = ({ setNotif }) => {

    const [selectedProject, setSelectedProject] = useRecoilState(
        selectedProjectSelector
    );

    return (
        // <div className="flex flex-col absolute z-50 right-0 w-96 bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
        <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
            
            <div className="pt-4 pl-4 pr-4  overflow-auto">
                <div className="flex flex-row justify-between mb-2">
                    <div className="flex flex-row justify-between space-x-3">
                    <svg className="mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.7658 16.1354L16.7455 15.0769V10.9744C16.7455 8.45538 15.4485 6.34667 13.1865 5.78872V5.23077C13.1865 4.54974 12.6566 4 12.0001 4C11.3437 4 10.8138 4.54974 10.8138 5.23077V5.78872C8.54391 6.34667 7.25474 8.44718 7.25474 10.9744V15.0769L6.23448 16.1354C5.73622 16.6523 6.08421 17.5385 6.78811 17.5385H17.2042C17.9161 17.5385 18.2641 16.6523 17.7658 16.1354ZM15.1637 15.8974H8.83654V10.9744C8.83654 8.93949 10.0308 7.28205 12.0001 7.28205C13.9695 7.28205 15.1637 8.93949 15.1637 10.9744V15.8974ZM12.0001 20C12.8701 20 13.5819 19.2615 13.5819 18.359H10.4183C10.4183 19.2615 11.1222 20 12.0001 20Z" fill="white"/>
</svg>
                        <p className="text-light-gray text-lg">
                            Notifications
                        </p>
                    </div>

                    <svg
                        onClick={() => {
                            setNotif(false);
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
            
        </div>
    );
};
