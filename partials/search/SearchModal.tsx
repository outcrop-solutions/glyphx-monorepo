import { useState, useEffect } from "react";
import React from "react";
import { useRecoilState,useRecoilValue } from "recoil";
import { useRouter } from "next/router";

import { showSearchModalAtom } from "state";
import { projectsSelector } from "@/state/globals";
import Fuse from "fuse.js"; // importing fuse

export function SearchModal() {

  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
  const projects = useRecoilValue(projectsSelector);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const router = useRouter();

  const testData = [
    {
      "name": "Sample Project 1",
      "modelID": "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      "name": "Sample Project 2",
      "modelID": "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      "name": "Robert Weed Project",
      "modelID": "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      "name": "Complicated Data",
      "modelID": "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    }
  ];

  const options = {
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
    keys: [
      "name",
    ]
  };

  // configure fuse
  const fuse = new Fuse(projects, options);

  function queryChange(e) {
    e.preventDefault();
    // console.log(e.target.value);
    setQuery(e.target.value);
    setQueryResult(prev => {
      return fuse.search(e.target.value)
    });
  }

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!showSearchModalOpen || keyCode !== 27) return;
      setShowSearchModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });


  //TODO: Figure out how to turn off search suggestion on click off. onBlur didnt work
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowSearchModalOpen(true);
      }}
      className="input-group flex flex-col justify-center relative rounded-2xl border border-gray z-60"
    >
      <div className="flex flex-col ">
        <div className="fixed top-2">
          <label htmlFor="action-search" className="sr-only">
            Search
          </label>
          <div className="flex justify-end items-center relative">
            <input
              autoComplete={"off"}
              id="action-search"
              className={`outline-none ${showSearchModalOpen ? "rounded-b-none" : "rounded-2xl"} pl-9 text-white placeholder-white border-white w-96 bg-transparent`}
              type="search"
              placeholder="Search My Projects"
              onChange={queryChange}
            />
            <div className=" w-8 h-8 absolute pt-3">
              <svg
                width="17"
                height="11"
                viewBox="0 0 17 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.7778 10.6667H9.55558C10.0445 10.6667 10.4445 10.2667 10.4445 9.77778C10.4445 9.28889 10.0445 8.88889 9.55558 8.88889H7.7778C7.28891 8.88889 6.88891 9.28889 6.88891 9.77778C6.88891 10.2667 7.28891 10.6667 7.7778 10.6667ZM0.666687 0.888889C0.666687 1.37778 1.06669 1.77778 1.55558 1.77778H15.7778C16.2667 1.77778 16.6667 1.37778 16.6667 0.888889C16.6667 0.4 16.2667 0 15.7778 0H1.55558C1.06669 0 0.666687 0.4 0.666687 0.888889ZM4.22224 6.22222H13.1111C13.6 6.22222 14 5.82222 14 5.33333C14 4.84444 13.6 4.44444 13.1111 4.44444H4.22224C3.73335 4.44444 3.33335 4.84444 3.33335 5.33333C3.33335 5.82222 3.73335 6.22222 4.22224 6.22222Z"
                  fill="#CECECE"
                />
              </svg>
            </div>
            <button
              className="absolute inset-0 right-auto group"
              type="submit"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4 shrink-0 fill-current text-white group-hover:text-gray ml-3 mr-2"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
            </button>
          </div>

          <div>
            {
              query === '' && showSearchModalOpen && (
                <div className="bg-white p-2 rounded-b-2xl">
                  <p className="text-xs font-semibold text-gray uppercase px-2 mb-2 mt-2">Recent Searches</p>
                  <ul>
                    {
                      projects.slice(0,5).map((value, index) => {
                        return (
                          <li key={index} className="hover:cursor-pointer" >
                            <a
                              onClick={() => {
                                setShowSearchModalOpen(!showSearchModalOpen);
                                router.push(`/project/${value.id}`);
                              }}
                              className="flex items-center p-2 text-gray hover:text-white hover:bg-indigo-500 rounded group"
                            >
                              <svg
                                className="w-4 h-4 fill-current text-gray group-hover:text-white group-hover:text-opacity-50 shrink-0 mr-3"
                                viewBox="0 0 16 16"
                              >
                                <path d="M15.707 14.293v.001a1 1 0 01-1.414 1.414L11.185 12.6A6.935 6.935 0 017 14a7.016 7.016 0 01-5.173-2.308l-1.537 1.3L0 8l4.873 1.12-1.521 1.285a4.971 4.971 0 008.59-2.835l1.979.454a6.971 6.971 0 01-1.321 3.157l3.107 3.112zM14 6L9.127 4.88l1.521-1.28a4.971 4.971 0 00-8.59 2.83L.084 5.976a6.977 6.977 0 0112.089-3.668l1.537-1.3L14 6z" />
                              </svg>
                              <span>{value.name}</span>
                            </a>
                          </li>
                        );
                      })
                    }
                  </ul>
                </div>
              )
            }

            {
              query !== '' && showSearchModalOpen && (
                <div className="bg-white p-2 rounded-b-2xl">
                  <p className="text-xs font-semibold text-gray uppercase px-2 mb-2 mt-2">Search Results</p>
                  <ul>
                    {
                      queryResult.splice(0,10).map((value, index) => {
                        return (
                          <li key={index} className="hover:cursor-pointer">
                            <a
                              onClick={() => {
                                setShowSearchModalOpen(!showSearchModalOpen);
                                router.push(`/project/${value.item.modelID}`);
                              }}
                              className="flex items-center p-2 text-gray hover:text-white hover:bg-indigo-500 rounded group"
                            >
                              <svg className="w-4 h-4 fill-current text-gray group-hover:text-white group-hover:text-opacity-50 shrink-0 mr-3" width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 10.6198V4.87968C14.0019 4.52884 13.9106 4.18379 13.7354 3.87983C13.5602 3.57587 13.3073 3.3239 13.0028 3.1497L7.99975 0.270148C7.69612 0.0932194 7.35099 0 6.99957 0C6.64815 0 6.30302 0.0932194 5.99938 0.270148L0.999772 3.14282C0.695568 3.31935 0.443091 3.57273 0.267631 3.87755C0.0921702 4.18238 -0.000113808 4.52796 2.19083e-05 4.87968V10.6198C-0.00162925 10.9709 0.0900791 11.3162 0.265752 11.6201C0.441425 11.9241 0.694748 12.176 0.999772 12.3498L5.99938 15.2302C6.30302 15.4072 6.64815 15.5004 6.99957 15.5004C7.35099 15.5004 7.69612 15.4072 7.99975 15.2302L13.0028 12.3498C13.3073 12.1756 13.5602 11.9237 13.7354 11.6197C13.9106 11.3157 14.0019 10.9707 14 10.6198ZM6.00025 12.9199L2.00038 10.6198V5.98965L6.00025 8.31982V12.9199ZM7 6.58726L3.03975 4.27948L7.00086 1.99926L10.962 4.27948L7 6.58726ZM11.9996 10.6173L7.99975 12.9199V8.31982L11.9996 5.98965V10.6173Z" fill="#CECECE" />
                              </svg>

                              <span>{value.item.name}</span>
                            </a>
                          </li>
                        );
                      })
                    }
                  </ul>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
