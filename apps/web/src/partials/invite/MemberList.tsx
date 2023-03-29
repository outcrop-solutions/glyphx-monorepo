import React from 'react';
import { PermissionsDropDown } from './PermissionsDropDown';
// import { useMembers } from '../../../services/useMembers'

import { projectAtom } from 'state';
import { useRecoilValue } from 'recoil';

export const MemberList = ({ size }) => {
  // const { results } = useMembers()
  const results = [
    // this is a test list
    { author: 'James Graham' },
    { author: 'Michael Wicks' },
    { author: 'Bryan Holster' },
    { author: 'William Linczer' },
    { author: 'Kyla McAndrews' },
  ];

  const selectedProject = useRecoilValue(projectAtom);

  return (
    <ul className="my-4 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray">
      {results.length > 0 ? (
        <>
          {results.map((item, idx) => (
            <li key={item.author}>
              <div className="flex items-center justify-between mb-2 w-full">
                <div className="flex items-center">
                  <div
                    className={`rounded-full ${
                      idx % 2 === 0 ? 'bg-blue' : 'bg-yellow'
                    } h-4 w-4 font-roboto font-medium text-[12px] text-center leading-[14px] tracking-[0.01em] text-white flex items-center justify-center mr-2`}
                  >
                    {`${item.author.split('@')[0][0].toUpperCase()}`}
                  </div>
                  <div
                    className={`w-10/12 text-light-gray ${
                      size === 'small' ? 'text-[10px]' : 'text-[12px]'
                    }  font-roboto font-normal leading-[14px]`}
                  >
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
