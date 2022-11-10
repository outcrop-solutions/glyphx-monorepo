import React, { useState, useEffect } from "react";
// import { API, graphqlOperation } from "aws-amplify";
// import { createState } from "graphql/mutations";
// import { v4 as uuid } from "uuid";
// import { PlusIcon } from "@heroicons/react/outline";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedProjectSelector } from "@/state/project";
import { statesSelector } from "@/state/states";

export const VisualizationProps = () => {
    const project = useRecoilValue(selectedProjectSelector);
    const [states, setStates] = useRecoilState(statesSelector);

    // useEffect(() => {
    //   // @ts-ignore
    //   if (window && window?.core) {
    //     // @ts-ignore
    //     //window.core.SendCameraPosition.connect(async function (message) {
    //       const createStateInput = {
    //         id: uuid(),
    //         title: "new_state",
    //         description: "",
    //         camera: message,
    //         queries: query ? query : "",
    //         projectID: project.id,
    //       };

    //       try {
    //         const result = await API.graphql(
    //           graphqlOperation(createState, { input: createStateInput })
    //         );
    //         // @ts-ignore
    //         setStates(result.data.createState);
    //       } catch (error) {
    //         console.log({ error });
    //       }
    //     });
    //   }
    // }, []);

    const addState = async () => {
        // @ts-ignore
        if (window 
            //&& window.core
            ) 
            {
            // @ts-ignore
            //await window.core.GetCameraPosition(true);
        }
    };

    return (
        <React.Fragment>
            <details open className="group">
                <summary className="flex h-11 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:text-white truncate border-b border-gray">
                    <div className="flex ml-2 items-center">
                        <span className="transition text-gray  duration-300 shrink-0 group-open:-rotate-180">
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fill="#CECECE"
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        <a>
                            <span className="text-sm ml-3 text-white "> Properties </span>
                        </a>
                    </div>
                </summary>

            </details>
        </React.Fragment>
    );
};
