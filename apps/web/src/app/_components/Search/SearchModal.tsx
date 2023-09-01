import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { rightSidebarControlAtom } from 'state/ui';
import { workspaceAtom } from 'state/workspace';
import { databaseTypes, webTypes } from 'types';
// importing fuse
import SearchInputIcon from 'public/svg/search-input-icon.svg';
import SearchFilterIcon from 'public/svg/search-filter-icon.svg';
import ProjectResultIcon from 'public/svg/project-result-icon.svg';
import { useParams } from 'next/navigation';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';
import { Route } from 'next';

export function SearchModal() {
  const params = useParams();
  const { workspaceId } = params as { workspaceId: string };

  const [rightSidebar, setRightSidebar] = useRecoilState(rightSidebarControlAtom);
  const workspace = useRecoilValue(workspaceAtom);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState([] as Fuse.FuseResult<databaseTypes.IProject>[]);

  // configure fuse
  const fuse = useMemo(
    () =>
      new Fuse(workspace.projects, {
        isCaseSensitive: false,
        // includeScore: false,
        shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        // fieldNormWeight: 1,
        keys: ['name'],
      }),
    [workspace.projects]
  );

  // TODO: Fix this use effect and stop it from constantly running
  useEffect(() => {
    if (query) {
      setQueryResult(fuse.search(query));
    }
  }, [fuse, query]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!rightSidebar || keyCode !== 27) return;
      setRightSidebar(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED;
        })
      );
    };
    /**
     * Used to handle clicking outside of search modal
     * @param e
     */
    const clickHandler = (e) => {
      try {
        // @ts-ignore
        if (document.getElementById('search').contains(e.target)) {
          // Clicked in box
        } else {
          // Clicked outside the box
          setRightSidebar(
            produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
              draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED;
            })
          );
        }
      } catch (error) {
        // do nothing
      }
    };
    document.addEventListener('keydown', keyHandler);
    window.addEventListener('click', clickHandler);
    return () => {
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('click', clickHandler);
    };
  });

  return (
    <div
      id="search"
      onClick={(e) => {
        e.stopPropagation();
        setRightSidebar(
          produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
            draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.SEARCH;
          })
        );
      }}
      className="input-group flex flex-col justify-center relative rounded border border-gray z-60"
    >
      <div className="flex flex-col ">
        <div className="">
          <div className="flex justify-end items-center relative">
            <input
              autoComplete={'off'}
              id="action-search"
              className={`outline-none ${
                rightSidebar ? 'rounded-b-none' : 'rounded' //rounded-2xl
              } pl-9 text-white placeholder-light-gray font-roboto font-normal text-[12px] leading-[14px] border-gray w-[400px] bg-transparent`}
              type="search"
              placeholder="Search owned projects..."
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
            <div className=" w-8 h-8 absolute pt-3">
              <SearchInputIcon />
            </div>
            <button className="absolute inset-0 right-auto group left-[2px]" type="submit" aria-label="Search">
              <SearchFilterIcon />
            </button>
          </div>

          <div>
            {!query && rightSidebar && (
              <div className="absolute top-8 w-full p-2 rounded-b-2xl z-60">
                <p className="font-roboto font-normal text-[12px] text-secondary-midnight leading-[14px] uppercase px-2 mb-2 mt-2">
                  Recent Projects
                </p>
                <ul>
                  {workspace.projects.slice(0, 5).map((value, index) => {
                    return (
                      <li key={index} className="hover:cursor-pointer">
                        <Link href={`/${workspaceId}/${value._id}` as Route}>
                          <a className="flex items-center p-2 text-gray hover:text-white hover:bg-indigo-500 rounded group">
                            <ProjectResultIcon />
                            <span>{value.name}</span>
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {query && rightSidebar && (
              <div className="absolute top-8 w-full p-2 rounded-b-2xl z-60">
                <p className="text-xs font-roboto font-semibold text-gray uppercase px-2 mb-2 mt-2">Search Results</p>
                <ul>
                  {queryResult.slice(0, 10).map((value, index) => {
                    return (
                      <li key={index} className="hover:cursor-pointer">
                        <Link href={`/${workspaceId}/${value.item._id}` as Route}>
                          <a
                            // onClick={() => {
                            //   setShowSearchModalOpen(false);
                            // }}
                            className="flex items-center p-2 text-gray hover:text-white hover:bg-indigo-500 rounded group"
                          >
                            <svg
                              className="w-8 h-8 fill-current text-gray group-hover:text-white group-hover:text-opacity-50 shrink-0 mr-3"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.3775 7.5L11.8775 9H18.5V16.5H6.5V7.5H10.3775ZM11 6H6.5C5.675 6 5.0075 6.675 5.0075 7.5L5 16.5C5 17.325 5.675 18 6.5 18H18.5C19.325 18 20 17.325 20 16.5V9C20 8.175 19.325 7.5 18.5 7.5H12.5L11 6Z"
                                fill="#CECECE"
                              />
                            </svg>

                            <span>{value.item.name}</span>
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
