import React, { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { projectsAtom, showAddProjectAtom } from "@/state/globals";
import { LinkDropDown, MemberList } from "../../invite";
import { PermissionsDropDown } from "../../invite";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createProject } from "graphql/mutations";
import { CreateProjectMutation } from "API";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";

import { userAtom, usernameSelector } from "@/state/user";


export const NewProject = ({ exit }) => {

    const router = useRouter();
    const username = useRecoilValue(usernameSelector);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState("");

    const setShowAddProject = useSetRecoilState(showAddProjectAtom);

    function createMembersArray(){
        if (members === "") { //if it is empty
            return []
        }
        var list = members.split(",");
        for (let index = 0; index < list.length; index++) {
            if (list[index].includes('@') && list[index].includes('.') || list[index] === "") {
                continue;
            }
            else{
                return null
            }   
        }
        return list;
    }

    /**
     * Verifies if input is good
     * @returns {BOOLEAN}
     */
    function verifyData(){
        if (name === "" || name === undefined || name === null) {
            return false;
        }
        if (createMembersArray() === null) {
            return false;
        }

        return true;
    }

    const handleSave = async () => {

        if(!verifyData()){
            alert("Invalid Data input");
            return;
        }

        let memebers = createMembersArray()

        const createProjectInput = {
            id: uuid(),
            name,
            description,
            expiry: new Date(),
            author: username,
            shared: [username, ...memebers],
        };
        console.log({ createProjectInput })
        try {
            const result = (await API.graphql(
                graphqlOperation(createProject, { input: createProjectInput })
            )) as { data: CreateProjectMutation };

            console.log({ result })

            setShowAddProject(false);
            router.push(`/project/${result.data.createProject.id}`);
        } catch (error) {
            console.log({ error });
        }
    };

    function test(){
        console.log({name},{description},{members})
        console.log(createMembersArray());
    }

    return (
        <div className="px-4 py-5 w-full">
            <div className="flex flex-row items-center justify-between border-b border-b-gray pb-1 mb-5">
                <p className="font-rubik font-normal text-[22px] leading-[26px] tracking-[0.01em] text-white">New Project</p>
                <svg onClick={exit} className="border border-transparent hover:border-white hover:cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.3002 5.71C17.9102 5.32 17.2802 5.32 16.8902 5.71L12.0002 10.59L7.11022 5.7C6.72022 5.31 6.09021 5.31 5.70021 5.7C5.31021 6.09 5.31021 6.72 5.70021 7.11L10.5902 12L5.70021 16.89C5.31021 17.28 5.31021 17.91 5.70021 18.3C6.09021 18.69 6.72022 18.69 7.11022 18.3L12.0002 13.41L16.8902 18.3C17.2802 18.69 17.9102 18.69 18.3002 18.3C18.6902 17.91 18.6902 17.28 18.3002 16.89L13.4102 12L18.3002 7.11C18.6802 6.73 18.6802 6.09 18.3002 5.71Z" fill="#CECECE" />
                </svg>

            </div>

            <p className="mb-2 font-rubik font-light text-[18px] leading-[21px] tracking-[0.01em] text-white">Project Details</p>

            <div className="flex flex-col space-y-2 mb-4">
                <input
                    className="h-8 pl-2 py-2 rounded border border-gray bg-transparent font-roboto font-normal text-[12px] leading-[14px] placeholder:text-light-gray text-light-gray"
                    placeholder="Project Name"
                    value={name}
                    onChange={(e)=>{
                        setName(e.target.value);
                    }}
                    type="text"
                />
                <input
                    className="h-8 pl-2 py-2 rounded border border-gray bg-transparent font-roboto font-normal text-[12px] leading-[14px] placeholder:text-light-gray text-light-gray"
                    placeholder="Project Description"
                    value={description}
                    onChange={(e)=>{
                        setDescription(e.target.value);
                    }}
                    type="text"
                />
            </div>

            <div className="flex flex-col w-full">
                <p className="mb-2 font-rubik font-light text-[18px] leading-[21px] tracking-[0.01em] text-white">Share With</p>
                <input
                    className="h-8 pl-2 py-2 rounded border border-gray bg-transparent font-roboto font-normal text-[12px] leading-[14px] placeholder:text-light-gray text-light-gray"
                    placeholder="Emails, comma seperated"
                    value={members}
                    onChange={(e)=>{
                        setMembers(e.target.value);
                    }}
                    type="text"
                />
                <div className="my-[10px] flex flex-row items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.2 7.99999C7.358 7.99999 8.3 7.05799 8.3 5.89999C8.3 4.74199 7.358 3.79999 6.2 3.79999C5.042 3.79999 4.1 4.74199 4.1 5.89999C4.1 7.05799 5.042 7.99999 6.2 7.99999ZM6.2 4.99999C6.698 4.99999 7.1 5.40199 7.1 5.89999C7.1 6.39799 6.698 6.79999 6.2 6.79999C5.702 6.79999 5.3 6.39799 5.3 5.89999C5.3 5.40199 5.702 4.99999 6.2 4.99999ZM6.2 9.04999C4.796 9.04999 2 9.75199 2 11.15V11.6C2 11.93 2.27 12.2 2.6 12.2H9.8C10.13 12.2 10.4 11.93 10.4 11.6V11.15C10.4 9.75199 7.604 9.04999 6.2 9.04999ZM3.404 11C3.908 10.652 5.126 10.25 6.2 10.25C7.274 10.25 8.492 10.652 8.996 11H3.404ZM10.424 9.08599C11.12 9.58999 11.6 10.262 11.6 11.15V12.2H13.4C13.73 12.2 14 11.93 14 11.6V11.15C14 9.93799 11.9 9.24799 10.424 9.08599ZM9.8 7.99999C10.958 7.99999 11.9 7.05799 11.9 5.89999C11.9 4.74199 10.958 3.79999 9.8 3.79999C9.476 3.79999 9.176 3.87799 8.9 4.00999C9.278 4.54399 9.5 5.19799 9.5 5.89999C9.5 6.60199 9.278 7.25599 8.9 7.78999C9.176 7.92199 9.476 7.99999 9.8 7.99999Z" fill="#595E68" />
                    </svg>

                    <p className="font-roboto font-normal text-[10px] leading-[12px] text-gray">This Project is shared with everyone at the Notre Dame Idea Center</p>
                </div>

                <div className="flex flex-col">
                    <div className="mb-2 flex flex-row justify-between items-center">

                        <LinkDropDown align={"left"} />

                        <PermissionsDropDown align={"right"} />

                    </div>
                </div>
            </div>
            <div className="mb-4 mt-4 flex flex-row justify-end items-center">
                <button onClick={handleSave} className="bg-primary-yellow py-2 px-2 font-roboto font-medium text-[14px] leading-[16px] text-secondary-space-blue">
                    Create
                </button>
            </div>


        </div>
    );

}