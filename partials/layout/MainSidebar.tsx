import { useState, useEffect, useRef } from "react";
// import { ExpandCollapse } from "./ExpandCollapse";
import { UserMenu } from "partials";
import { useRouter } from "next/router";
import Link from "next/link";
import { isMainSidebarExpandedAtom } from "@/state/globals";
import { useRecoilValue } from "recoil";
import { selectedProjectSelector } from "@/state/project";
import Image from "next/image";
import GLogo from "Media/Images/MainSidebar_G_Logo.svg";
import FullLogo from "Media/Images/MainSidebar_Full_Logo.svg"

export const MainSidebar = () => {
  // const isMainSidebarExpanded = useRecoilValue(isMainSidebarExpandedAtom);
  const router = useRouter();
  const { pathname } = router;

  const selectedProject = useRecoilValue(selectedProjectSelector);

  return (
    <div
      id="sidebar"
      className={`hidden lg:flex flex-col absolute z-40 bg-secondary-space-blue left-0 top-0 lg:static lg:left-auto lg:top-auto h-screen scrollbar-none ${pathname === "/" ? "w-64" : "w-20"
        } shrink-0 p-4`}
    >
      <div className="">
        {/* Sidebar header */}
        <div
          className={
            selectedProject
              ? "flex justify-center mb-2 pr-3 sm:px-2 border-white border-b-2 py-1"
              : "flex justify-between mb-2 pr-3 sm:px-2 border-white border-b-2 py-3"
          }
        >
          {/* Logo */}
          <div className="flex pb-1 justify-center">
            {
              selectedProject ?

                <Image
                  src={GLogo}
                  height={60}
                />
                :
                <Image
                  src={FullLogo}
                />
            }

          </div>
          {
            !selectedProject && (
              <div className="flex border border-transparent rounded-lg pr-2 pl-2 hover:cursor-pointer">
                {pathname === "/" && (
                  <div className="flex items-center justify-center ">
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
                    <span className="text-white ml-2">Back</span>
                  </div>
                )}
              </div>
            )
          }
        </div>

        {/* Links */}
        <div className="space-y-8 mt-1">
          {/* Pages group */}
          <div>
            {/* <div className="text-xs uppercase text-gray font-semibold border-b pb-2 border-white flex justify-center lg:justify-start lg:ml-3 items-center">
              <span
                className="hidden lg:block lg:hidden text-center w-6"
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4C7.584 4 4 7.584 4 12C4 16.416 7.584 20 12 20C16.416 20 20 16.416 20 12C20 7.584 16.416 4 12 4ZM8.056 17.024C8.4 16.304 10.496 15.6 12 15.6C13.504 15.6 15.608 16.304 15.944 17.024C14.856 17.888 13.488 18.4 12 18.4C10.512 18.4 9.144 17.888 8.056 17.024ZM17.088 15.864C15.944 14.472 13.168 14 12 14C10.832 14 8.056 14.472 6.912 15.864C6.096 14.792 5.6 13.456 5.6 12C5.6 8.472 8.472 5.6 12 5.6C15.528 5.6 18.4 8.472 18.4 12C18.4 13.456 17.904 14.792 17.088 15.864ZM12 7.2C10.448 7.2 9.2 8.448 9.2 10C9.2 11.552 10.448 12.8 12 12.8C13.552 12.8 14.8 11.552 14.8 10C14.8 8.448 13.552 7.2 12 7.2ZM12 11.2C11.336 11.2 10.8 10.664 10.8 10C10.8 9.336 11.336 8.8 12 8.8C12.664 8.8 13.2 9.336 13.2 10C13.2 10.664 12.664 11.2 12 11.2Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span className="lg:hidden block">
                <UserMenu
                  align="right"
                  user={user}
                  setIsLoggedIn={setIsLoggedIn}
                />
              </span>
            </div> */}
            <ul className="mt-3">
              {/* Dashboard */}
              <li
                className={`px-3 py-1 rounded-full mb-0.5 last:mb-0 ${pathname === "/" && "bg-transparent"
                  }`}
              >
                <div
                  className={`block text-gray hover:text-white truncate transition duration-150 ${pathname === "/" && "hover:text-gray"
                    }`}
                >
                  <div
                    className={
                      selectedProject
                        ? "flex rounded-lg pr-5 pt-1 pb-1 border border-transparent hover:border-white hover:cursor-pointer"
                        : "flex border border-white rounded-lg pr-4 pt-1 pb-1 hover:cursor-pointer"
                    }
                  >
                    <div className="flex items-center justify-center h-6 w-6">
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 14 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 10.6198V4.87968C14.0019 4.52884 13.9106 4.18379 13.7354 3.87983C13.5602 3.57587 13.3073 3.3239 13.0028 3.1497L7.99975 0.270148C7.69612 0.0932194 7.35099 0 6.99957 0C6.64815 0 6.30302 0.0932194 5.99938 0.270148L0.999772 3.14282C0.695568 3.31935 0.443091 3.57273 0.267631 3.87755C0.0921702 4.18238 -0.000113808 4.52796 2.19083e-05 4.87968V10.6198C-0.00162925 10.9709 0.0900791 11.3162 0.265752 11.6201C0.441425 11.9241 0.694748 12.176 0.999772 12.3498L5.99938 15.2302C6.30302 15.4072 6.64815 15.5004 6.99957 15.5004C7.35099 15.5004 7.69612 15.4072 7.99975 15.2302L13.0028 12.3498C13.3073 12.1756 13.5602 11.9237 13.7354 11.6197C13.9106 11.3157 14.0019 10.9707 14 10.6198ZM6.00025 12.9199L2.00038 10.6198V5.98965L6.00025 8.31982V12.9199ZM7 6.58726L3.03975 4.27948L7.00086 1.99926L10.962 4.27948L7 6.58726ZM11.9996 10.6173L7.99975 12.9199V8.31982L11.9996 5.98965V10.6173Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-100 duration-200 text-white">
                      My Projects
                    </span>
                  </div>
                </div>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes("shared") && "bg-gray-800"
                  }`}
              >
                <div
                  className={`block text-gray truncate transition duration-150 ${pathname.includes("shared") && "hover:text-gray"
                    }`}
                >
                  <div className="flex">
                    <div className="flex items-center justify-center h-6 w-6">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.25 13.5625C7.495 13.5625 4 14.44 4 16.1875V17.5H14.5V16.1875C14.5 14.44 11.005 13.5625 9.25 13.5625ZM5.755 16C6.385 15.565 7.9075 15.0625 9.25 15.0625C10.5925 15.0625 12.115 15.565 12.745 16H5.755ZM9.25 12.25C10.6975 12.25 11.875 11.0725 11.875 9.625C11.875 8.1775 10.6975 7 9.25 7C7.8025 7 6.625 8.1775 6.625 9.625C6.625 11.0725 7.8025 12.25 9.25 12.25ZM9.25 8.5C9.8725 8.5 10.375 9.0025 10.375 9.625C10.375 10.2475 9.8725 10.75 9.25 10.75C8.6275 10.75 8.125 10.2475 8.125 9.625C8.125 9.0025 8.6275 8.5 9.25 8.5ZM14.53 13.6075C15.4 14.2375 16 15.0775 16 16.1875V17.5H19V16.1875C19 14.6725 16.375 13.81 14.53 13.6075ZM13.75 12.25C15.1975 12.25 16.375 11.0725 16.375 9.625C16.375 8.1775 15.1975 7 13.75 7C13.345 7 12.97 7.0975 12.625 7.2625C13.0975 7.93 13.375 8.7475 13.375 9.625C13.375 10.5025 13.0975 11.32 12.625 11.9875C12.97 12.1525 13.345 12.25 13.75 12.25Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-100 duration-200 text-white">
                      Shared
                    </span>
                  </div>
                </div>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes("shared") && "bg-primary-dark-blue"
                  }`}
              >
                <div
                  className={`block text-gray truncate transition duration-150 ${pathname.includes("shared") && "hover:text-gray"
                    }`}
                >
                  <div className="flex">
                    <div className={`flex items-center justify-center h-6 w-6 ${selectedProject ? "ml-1" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.6422 1.73444L12.5611 0.427778C12.3511 0.163333 12.0322 0 11.6667 0H2.33333C1.96778 0 1.64889 0.163333 1.43111 0.427778L0.357778 1.73444C0.132222 1.99889 0 2.34889 0 2.72222V12.4444C0 13.3 0.7 14 1.55556 14H12.4444C13.3 14 14 13.3 14 12.4444V2.72222C14 2.34889 13.8678 1.99889 13.6422 1.73444ZM2.52 1.55556H11.48L12.11 2.31H1.89778L2.52 1.55556ZM1.55556 12.4444V3.88889H12.4444V12.4444H1.55556ZM8.12778 5.44444H5.87222V7.77778H3.88889L7 10.8889L10.1111 7.77778H8.12778V5.44444Z" fill="white" />
                      </svg>


                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-100 duration-200 text-white">
                      Archived
                    </span>
                  </div>
                </div>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${pathname.includes("shared") && "bg-primary-dark-blue"
                  }`}
              >
                <a
                  href="/trash"
                  className={`block text-gray truncate transition duration-150 ${pathname.includes("shared") && "hover:text-gray"
                    }`}
                >
                  <div className="flex">
                    <div className="flex items-center justify-center h-6 w-6">
                      <div className="flex items-center justify-center h-6 w-6">
                        <svg
                          width="12"
                          height="15"
                          viewBox="0 0 12 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.28571 12.5714C1.28571 13.4357 1.99286 14.1429 2.85714 14.1429H9.14286C10.0071 14.1429 10.7143 13.4357 10.7143 12.5714V4.71429C10.7143 3.85 10.0071 3.14286 9.14286 3.14286H2.85714C1.99286 3.14286 1.28571 3.85 1.28571 4.71429V12.5714ZM3.64286 4.71429H8.35714C8.78929 4.71429 9.14286 5.06786 9.14286 5.5V11.7857C9.14286 12.2179 8.78929 12.5714 8.35714 12.5714H3.64286C3.21071 12.5714 2.85714 12.2179 2.85714 11.7857V5.5C2.85714 5.06786 3.21071 4.71429 3.64286 4.71429ZM8.75 0.785714L8.19214 0.227857C8.05071 0.0864285 7.84643 0 7.64214 0H4.35786C4.15357 0 3.94929 0.0864285 3.80786 0.227857L3.25 0.785714H1.28571C0.853571 0.785714 0.5 1.13929 0.5 1.57143C0.5 2.00357 0.853571 2.35714 1.28571 2.35714H10.7143C11.1464 2.35714 11.5 2.00357 11.5 1.57143C11.5 1.13929 11.1464 0.785714 10.7143 0.785714H8.75Z"
                            fill="#FFFFFF"
                          />
                        </svg>
                      </div>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-100 duration-200 text-white">
                      Trash
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        {/* <div className="sticky bottom-0">
          <ExpandCollapse
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
        </div> */}
      </div>
    </div>
  );
};
