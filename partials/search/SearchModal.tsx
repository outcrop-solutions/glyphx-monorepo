import React from "react";
import { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter } from "next/router";
import Link from "next/link";

import { showSearchModalAtom } from "state";
import { projectsAtom } from "@/state/globals";
import Fuse from "fuse.js"; // importing fuse

export function SearchModal() {
  const router = useRouter();
  const [showSearchModalOpen, setShowSearchModalOpen] =
    useRecoilState(showSearchModalAtom);
  const projects = useRecoilValue(projectsAtom);
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState([]);

  const testData = [
    {
      name: "Sample Project 1",
      modelID: "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      name: "Sample Project 2",
      modelID: "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      name: "Robert Weed Project",
      modelID: "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
    {
      name: "Complicated Data",
      modelID: "5cfaef9c-49cd-4cac-a150-d814d07cfb72",
    },
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
    keys: ["name"],
  };

  // configure fuse
  const fuse = new Fuse(projects, options);

  // TODO: Fix this use effect and stop it from constantly running
  useEffect(() => {
    if (query) {
      setQueryResult((prev) => {
        return fuse.search(query);
      });
    }
  }, [query]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!showSearchModalOpen || keyCode !== 27) return;
      setShowSearchModalOpen(false);
    };
    /**
     * Used to handle clicking outside of search modal
     * @param e 
     */
    const clickHandler = (e) =>{
      try {
        if (document.getElementById('search').contains(e.target)){
          // Clicked in box
          // console.log("in search")
        } else{
          // Clicked outside the box
          // console.log("out of search");
          setShowSearchModalOpen(false);
        }
      } catch (error) {
        // do nothing
      }
    }
    document.addEventListener("keydown", keyHandler);
    window.addEventListener('click',clickHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("click", clickHandler);
    }
  });

  return (
    <div
    id="search"
      onClick={(e) => {
        console.log("on click hit")
        e.stopPropagation();
        setShowSearchModalOpen(true);
      }}
      className="input-group flex flex-col justify-center relative rounded-2xl border border-gray z-60"
    >
      <div
      className="flex flex-col ">
        <div
        className="fixed top-2">
          <label htmlFor="action-search" className="sr-only">
            Search
          </label>
          <div className="flex justify-end items-center relative">
            <input
              autoComplete={"off"}
              id="action-search"
              className={`outline-none ${
                showSearchModalOpen ? "rounded-b-none" : "rounded-2xl"
              } pl-9 text-white placeholder-white border-white w-96 bg-transparent`}
              type="search"
              placeholder="Search My Projects"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
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
            {!query && showSearchModalOpen && (
              <div className="bg-white p-2 rounded-b-2xl">
                <p className="text-xs font-semibold text-gray uppercase px-2 mb-2 mt-2">
                  Recent Projects
                </p>
                <ul>
                  {projects.slice(0, 5).map((value, index) => {
                    return (
                      <li key={index} className="hover:cursor-pointer">
                        <Link href={`/project/${value.id}`}>
                          <a
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
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {query && showSearchModalOpen && (
              <div className="bg-white p-2 rounded-b-2xl">
                <p className="text-xs font-semibold text-gray uppercase px-2 mb-2 mt-2">
                  Search Results
                </p>
                <ul>
                  {queryResult.slice(0, 10).map((value, index) => {
                    return (
                      <li key={index} className="hover:cursor-pointer">
                        <Link href={`/project/${value.item.id}`}>
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
