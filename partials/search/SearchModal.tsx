import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Transition } from "utils/Transition";
import React from "react";
import { useRecoilState } from "recoil";

import { showSearchModalAtom } from "state";
import Fuse from "fuse.js"; // importing fuse

export function SearchModal() {
  // const [showSearchModalOpen, setSearchOpen] = useState(false);

  const trigger = useRef(null);
  const searchContent = useRef(null);
  const searchInput = useRef(null);


  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);

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

  const fuse = new Fuse(testData, options);

  // const result = fuse.search("Robert Weed");
  // alert(result)

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (
        !showSearchModalOpen ||
        searchContent.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setShowSearchModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!showSearchModalOpen || keyCode !== 27) return;
      setShowSearchModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  // return(
  //   <div className="w-8 h-8 flex items-center justify-center bg-gray">
  //     <div>
  //     <div className="relative">
  //           <label htmlFor="modal-search" className="sr-only">
  //             Search
  //           </label>
  //           <input
  //             id="modal-search"
  //             className="w-full border-0 focus:ring-transparent placeholder-gray appearance-none py-3 pl-10 pr-4"
  //             type="search"
  //             placeholder="Search Anything…"
  //             ref={searchInput}
  //           />
  //           <button
  //             className="absolute inset-0 right-auto group"
  //             type="submit"
  //             aria-label="Search"
  //           >
  //             <svg
  //               className="w-4 h-4 shrink-0 fill-current text-gray group-hover:text-gray ml-4 mr-2"
  //               viewBox="0 0 16 16"
  //               xmlns="http://www.w3.org/2000/svg"
  //             >
  //               <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
  //               <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
  //             </svg>
  //           </button>
  //         </div>
  //     </div>
  //     <div>

  //     </div>
  //   </div>
  // );

  return (
    <div className="absolute top-5">
      {/* Button */}
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center bg-gray hover:bg-gray transition duration-150 rounded-full ml-3 ${showSearchModalOpen && "bg-gray"
          }`}
        onClick={() => {
          setShowSearchModalOpen(!showSearchModalOpen);
          // setImmediate(() => searchInput.current.focus());
        }}
        aria-controls="search-modal"
      >
        <span className="sr-only">Search</span>
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="fill-current text-gray"
            d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
          />
          <path
            className="fill-current text-gray"
            d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z"
          />
        </svg>
      </button>
      {/* Modal backdrop */}
      {/* <Transition
        className="fixed inset-0 bg-primary-dark-blue bg-opacity-30 z-50 transition-opacity"
        show={showSearchModalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      /> */}
      {/* Modal dialog */}
      {/* <Transition
        id="search-modal"
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center transform px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={showSearchModalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      > */}
      <div
        className="bg-white overflow-auto scrollbar-track-transparent scrollbar-thumb-yellow max-w-2xl w-full max-h-full rounded shadow-lg"
        ref={searchContent}
      >
        {/* Search form */}
        <form className="border-b border-gray">
          <div className="relative">
            <label htmlFor="modal-search" className="sr-only">
              Search
            </label>
            <input
              id="modal-search"
              className="w-full border-0 focus:ring-transparent placeholder-gray appearance-none py-3 pl-10 pr-4"
              type="search"
              placeholder="Search Anything…"
              ref={searchInput}
            />
            <button
              className="absolute inset-0 right-auto group"
              type="submit"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4 shrink-0 fill-current text-gray group-hover:text-gray ml-4 mr-2"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
            </button>
          </div>
        </form>
        <div
          className="py-4 px-2"
          onFocus={() => setShowSearchModalOpen(true)}
          onBlur={() => setShowSearchModalOpen(false)}
        >
          {/* Recent searches */}
          <div className="mb-3 last:mb-0">
            <div className="text-xs font-semibold text-gray uppercase px-2 mb-2">
              Recent searches
            </div>
            <ul className="text-sm">
              {
                testData.map((value, index) => {
                  return (
                    <li key={index}>
                      <Link href="#0">
                        <a
                          onClick={() => setShowSearchModalOpen(!showSearchModalOpen)}
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
                })
              }
            </ul>
          </div>
          {/* Recent pages */}
          {/* <div className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-gray uppercase px-2 mb-2">
                Recent pages {showSearchModalOpen ? "State is True" : "State is false"}
              </div>
              <ul className="text-sm">
              {
                  testData.map((value,index) => {
                    return(
                      <li key={index}>
                  <Link href="#0">
                    <a
                      onClick={() => setShowSearchModalOpen(!showSearchModalOpen)}
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
                  })
                }
              </ul>
            </div> */}
        </div>
      </div>
      {/* </Transition> */}
    </div>
  );
}
