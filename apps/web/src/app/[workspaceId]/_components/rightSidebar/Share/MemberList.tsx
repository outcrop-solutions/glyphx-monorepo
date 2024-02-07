import React from 'react';
import {PermissionsDropDown} from './PermissionsDropDown';

export const MemberList = ({size, members}) => {
  return (
    members && (
      <ul className="my-4 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray">
        {members.length > 0 ? (
          <>
            {members.map((mem, idx) => (
              <li key={mem?.id}>
                <div className="flex items-center justify-between mb-2 w-full">
                  <div className="flex items-center">
                    <div
                      className={`rounded-full ${
                        idx % 2 === 0 ? 'bg-secondary-cyan' : 'bg-yellow'
                      } h-4 w-4 font-roboto font-medium text-[12px] text-center leading-[14px] tracking-[0.01em] text-white flex items-center justify-center mr-2`}
                    >
                      {`${mem?.email?.charAt(0)?.toUpperCase()}`}
                    </div>
                    <div
                      className={`w-10/12 text-light-gray ${
                        size === 'small' ? 'text-[10px]' : 'text-[12px]'
                      }  font-roboto font-normal leading-[14px]`}
                    >
                      {mem?.email}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </>
        ) : null}
      </ul>
    )
  );
};
