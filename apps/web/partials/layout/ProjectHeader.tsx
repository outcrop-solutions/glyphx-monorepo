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
    showNotificationAtom,
    payloadSelector,
    propertiesAtom,
    sdtValue,
    rowsSelector
} from "state";
export const ProjectHeader = () => {
    const [selectedProject, setSelectedProject] = useRecoilState(
        selectedProjectSelector
    );
    // console.log({selectedProject})
    const setShowAddProject = useSetRecoilState(showAddProjectAtom);
    const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
    const [isShareOpen,setShare] = useRecoilState(shareOpenAtom);
    const [isInfoOpen,setShowInfo] = useRecoilState(showInfoAtom);
    const [isNotificationOpen,setNotification] = useRecoilState(showNotificationAtom);
    const [paneOrientation, setOrientation] = useRecoilState(orientationAtom);
    const payload = useRecoilValue(payloadSelector);
    const setProperties = useSetRecoilState(propertiesAtom);
    const [sdtName, setSDTName] = useRecoilState(sdtValue);
    const rows = useRecoilValue(rowsSelector);

    const router = useRouter();



    const backPresssed = () => {
        setSelectedProject(null);
        setShare(false);
        setShowInfo(false);
        setNotification(false);
        setShowSearchModalOpen(false);
        setSDTName(null);
        setProperties([ // TODO: THIS IS A TEMPORARY FIX, BUT NEED TO FIGURE OUT A MORE EFFICIENT WAY OF RESETING PROPERTIES
            { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
            { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        ]);
        try { //close glyph viewer
            //@ts-ignore
            window?.core.CloseModel();
        } catch (error) {
            // do nothng
        }
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

    return (
        <div
            className={`sticky flex items-center bg-secondary-space-blue border-l border-b border-gray h-[50px] w-full pl-[16px] ${rows?.length > 0 && (!isShareOpen && !isInfoOpen && !isNotificationOpen)  ? "pr-[16px]" : "pr-[16px]"}`}
        >

            <button
                onClick={backPresssed}
                className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 pt-1 pb-1 hover:border-white"
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
                <span className="text-light-gray font-roboto font-medium text-[14px] leading-[16px] text-center ml-2">Back</span>
            </button>



            <input
                // group
                className="p-1 m-2 text-white font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] flex text-left outline-none border-2 border-transparent rounded-lg pr-2 ml-6 bg-transparent hover:border-yellow"
                defaultValue={selectedProject?.name}
                onChange={handleEditProjectName}
            />

            <div className="px-4 sm:px-6 lg:px-0 lg:w-full">
                <div className={`flex items-center ${selectedProject ? "justify-end" : "justify-between"} h-16`}>
                    {/* Search form */}

                    {/* Header: Right side */}
                    <div className="flex justify-end items-center space-x-2">


                        <button
                            className={`h-6 px-2 flex items-center justify-center bg-primary-yellow hover:bg-primary-yellow-hover transition duration-150 rounded-[2px] ml-3 ${showSearchModalOpen && "bg-gray"
                                }`}
                            onClick={(e) => {
                                // setShowAddProject(selectedProject ? true : false);
                                setShowInfo(false);
                                setShare(true);
                                setNotification(false);
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

                            <b className="text-secondary-midnight font-roboto font-medium font-[14px] leading-[16px] pl-1">Share</b>
                        </button>

                        {sdtName && (
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



                        <button
                            className={`h-8 p-2 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-3`}
                            onClick={(e) => {
                                // setShowAddProject(selectedProject ? true : false);
                                setShare(false);
                                setShowInfo(true);
                                setNotification(false);
                            }}
                            aria-controls="info-modal"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.2 4H8.8V5.6H7.2V4ZM7.2 7.2H8.8V12H7.2V7.2ZM8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8 14.4C4.472 14.4 1.6 11.528 1.6 8C1.6 4.472 4.472 1.6 8 1.6C11.528 1.6 14.4 4.472 14.4 8C14.4 11.528 11.528 14.4 8 14.4Z" fill="white" />
                            </svg>
                        </button>

                        {/* {selectedProject && <DeleteModel align="right" />} */}
                        {/* Below is causing empty user bubble */}
                        {/* {selectedProject && <Help />} */}

                        <button
                            className={`h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0`}
                            onClick={(e) => {
                                // setShowAddProject(selectedProject ? true : false);
                                setShare(false);
                                setShowInfo(false);
                                setNotification(true);
                            }}
                            aria-controls="notifications-modal"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.7658 16.1354L16.7455 15.0769V10.9744C16.7455 8.45538 15.4485 6.34667 13.1865 5.78872V5.23077C13.1865 4.54974 12.6566 4 12.0001 4C11.3437 4 10.8138 4.54974 10.8138 5.23077V5.78872C8.54391 6.34667 7.25474 8.44718 7.25474 10.9744V15.0769L6.23448 16.1354C5.73622 16.6523 6.08421 17.5385 6.78811 17.5385H17.2042C17.9161 17.5385 18.2641 16.6523 17.7658 16.1354ZM15.1637 15.8974H8.83654V10.9744C8.83654 8.93949 10.0308 7.28205 12.0001 7.28205C13.9695 7.28205 15.1637 8.93949 15.1637 10.9744V15.8974ZM12.0001 20C12.8701 20 13.5819 19.2615 13.5819 18.359H10.4183C10.4183 19.2615 11.1222 20 12.0001 20Z" fill="white"/>
</svg>

                        </button>

                        {/* <DropdownNotifications align="right" /> */}



                    </div>
                </div>
            </div>
        </div>
    );
};