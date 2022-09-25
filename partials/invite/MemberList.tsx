import React from "react";
import { PermissionsDropDown } from "./PermissionsDropDown";
// import { useMembers } from '../../../services/useMembers'

import {
  selectedProjectSelector,
} from "state";
import { useRecoilValue } from "recoil";

export const MemberList = () => {
  // const { results } = useMembers()
  const results = [
    { author: "James Graham" },
    { author: "Michael Wicks" },
    { author: "Bryan Holster" },
    { author: "William Linczer" },
    { author: "Kyla McAndrews" },
  ];

  const selectedProject= useRecoilValue(selectedProjectSelector);

  return (
    <ul className='my-4 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray'>
      {results.length > 0 ? (
        <>
          {selectedProject.shared.map((item, idx) => (
            <li key={item}>
              <div className="flex items-center justify-between mb-2 w-full">
                <div className="flex items-center">
                  <div
                    className={`rounded-full ${
                      idx % 2 === 0 ? "bg-blue" : "bg-yellow"
                    } h-5 w-5 text-sm text-white flex items-center justify-center mr-2`}
                  >
                    {`${item.split("@")[0][0].toUpperCase()}`}
                  </div>
                  <div className="w-10/12 text-white text-xs">
                    {item}
                  </div>
                </div>
                {/* <PermissionsDropDown align="right" /> */}
              </div>
            </li>
          ))}
        </>
      ) : null}
    </ul>
  );
};
