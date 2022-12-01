import { useState, useEffect, useRef } from "react";
import { UserMenu } from "partials";
import { useRouter } from "next/router";
import Link from "next/link";
import { isMainSidebarExpandedAtom } from "@/state/globals";
import { useRecoilValue } from "recoil";
import { selectedProjectSelector } from "@/state/project";
import Image from "next/image";
import GLogo from "Media/Images/MainSidebar_G_Logo.svg";
import FullLogo from "Media/Images/MainSidebar_Full_Logo.svg"

export const MainSidebar = ({ index, setIndex }) => {
  // const isMainSidebarExpanded = useRecoilValue(isMainSidebarExpandedAtom);
  const router = useRouter();
  const { pathname } = router;

  const selectedProject = useRecoilValue(selectedProjectSelector);

  return (
    <div
      id="MainSidebar"
      className={`flex flex-col border border-r-gray  bg-secondary-space-blue  h-screen scrollbar-none w-64 shrink-0 p-4`}
    >
      {/* Sidebar header */}
      <div
        className={"flex justify-between mb-2 pr-3 sm:px-2 border-white border-b"}
      >
        {/* Logo */}
        <div className="flex pb-1 justify-center">
          <Image
            src={FullLogo}
          />
          {/* {
              selectedProject ?

                <Image
                  src={GLogo}
                  height={60}
                />
                :
                <Image
                  src={FullLogo}
                />
            } */}

        </div>
      </div>

      {/* Links */}
      <div className=" mt-1">
        {/* Pages group */}

        <ul className="mt-3 space-y-2 font-roboto font-medium text-[14px] leading-[16px]">
          {/* Dashboard */}
          <li
            className={`group`}
            onClick={() => {
              setIndex(0);
            }}
          >
            <div
              className={`flex items-center border border-transparent rounded pr-4 pt-1 pb-1 group-hover:cursor-pointer hover:text-white truncate transition duration-150 group-hover:bg-secondary-midnight ${index === 0 ? "bg-secondary-midnight border-white" : "group-hover:border-white"}`}
            >

              <div className="flex items-center justify-center h-6 w-6">
                <svg className="fill-current text-light-gray group-hover:text-white" width="24" height="24" viewBox="0 0 24 24" >
                  <g clip-path="url(#clip0_3181_13896)">
                    <path d="M11.992 4C7.576 4 4 7.584 4 12C4 16.416 7.576 20 11.992 20C16.416 20 20 16.416 20 12C20 7.584 16.416 4 11.992 4ZM12 18.4C8.464 18.4 5.6 15.536 5.6 12C5.6 8.464 8.464 5.6 12 5.6C15.536 5.6 18.4 8.464 18.4 12C18.4 15.536 15.536 18.4 12 18.4ZM11.824 8H11.776C11.456 8 11.2 8.256 11.2 8.576V12.352C11.2 12.632 11.344 12.896 11.592 13.04L14.912 15.032C15.184 15.192 15.536 15.112 15.696 14.84C15.864 14.568 15.776 14.208 15.496 14.048L12.4 12.208V8.576C12.4 8.256 12.144 8 11.824 8Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_3181_13896">
                      <rect width="24" height="24" />
                    </clipPath>
                  </defs>
                </svg>

              </div>

              <span className="ml-3 duration-100 text-light-gray group-hover:text-white">
                Recents
              </span>

            </div>
          </li>
          {/* Drafts */}
          <li
            className={`group`}
            onClick={() => {
              setIndex(1);
            }}
          >
            <div
              className={`flex items-center hover:cursor-pointer pr-4 pt-1 pb-1 group-hover:bg-secondary-midnight border border-transparent rounded text-gray truncate transition duration-150 ${index === 1 ? "bg-secondary-midnight border-white" : "group-hover:border-white"}`}
            >

              <div className="flex items-center justify-center h-6 w-6">
                <svg className="fill-current text-light-gray group-hover:text-white" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M13.5 4H7.5C6.675 4 6.0075 4.675 6.0075 5.5L6 17.5C6 18.325 6.6675 19 7.4925 19H16.5C17.325 19 18 18.325 18 17.5V8.5L13.5 4ZM7.5 17.5V5.5H12.75V9.25H16.5V17.5H7.5Z" />
                </svg>

              </div>

              <span className="ml-3 duration-100 text-light-gray group-hover:text-white">
                Drafts
              </span>

            </div>
          </li>
          {/* Shared */}
          <li
            className={`group`}
            onClick={() => {
              setIndex(2);
            }}
          >
            <div
              className={`flex items-center hover:cursor-pointer pr-4 pt-1 pb-1 group-hover:bg-secondary-midnight border border-transparent rounded text-gray truncate transition duration-150 ${index === 2 ? "bg-secondary-midnight border-white" : "group-hover:border-white"}`}
            >

              <div className={`flex items-center justify-center h-6 w-6 ${selectedProject ? "ml-1" : ""}`}>
                <svg className="fill-current text-light-gray group-hover:text-white" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M9.6 13C7.728 13 4 13.936 4 15.8V17.2H15.2V15.8C15.2 13.936 11.472 13 9.6 13ZM5.872 15.6C6.544 15.136 8.168 14.6 9.6 14.6C11.032 14.6 12.656 15.136 13.328 15.6H5.872ZM9.6 11.6C11.144 11.6 12.4 10.344 12.4 8.8C12.4 7.256 11.144 6 9.6 6C8.056 6 6.8 7.256 6.8 8.8C6.8 10.344 8.056 11.6 9.6 11.6ZM9.6 7.6C10.264 7.6 10.8 8.136 10.8 8.8C10.8 9.464 10.264 10 9.6 10C8.936 10 8.4 9.464 8.4 8.8C8.4 8.136 8.936 7.6 9.6 7.6ZM15.232 13.048C16.16 13.72 16.8 14.616 16.8 15.8V17.2H20V15.8C20 14.184 17.2 13.264 15.232 13.048ZM14.4 11.6C15.944 11.6 17.2 10.344 17.2 8.8C17.2 7.256 15.944 6 14.4 6C13.968 6 13.568 6.104 13.2 6.28C13.704 6.992 14 7.864 14 8.8C14 9.736 13.704 10.608 13.2 11.32C13.568 11.496 13.968 11.6 14.4 11.6Z" />
                </svg>



              </div>

              <span className="ml-3 duration-100 text-light-gray group-hover:text-white">
                Shared
              </span>

            </div>
          </li>
          {/* Trash */}
          <li
            className={`group`}
            onClick={() => {
              setIndex(3);
            }}
          >
            <div
              className={`flex items-center hover:cursor-pointer pr-4 pt-1 pb-1 group-hover:bg-secondary-midnight border border-transparent rounded text-gray truncate transition duration-150 ${index === 3 ? "bg-secondary-midnight border-white" : "group-hover:border-white"}`}
            >

              <div className="flex items-center justify-center h-6 w-6">
                <div className="flex items-center justify-center h-6 w-6">
                  <svg
                    className="fill-current text-light-gray group-hover:text-white"
                    width="12"
                    height="15"
                    viewBox="0 0 12 15"
                  >
                    <path
                      d="M1.28571 12.5714C1.28571 13.4357 1.99286 14.1429 2.85714 14.1429H9.14286C10.0071 14.1429 10.7143 13.4357 10.7143 12.5714V4.71429C10.7143 3.85 10.0071 3.14286 9.14286 3.14286H2.85714C1.99286 3.14286 1.28571 3.85 1.28571 4.71429V12.5714ZM3.64286 4.71429H8.35714C8.78929 4.71429 9.14286 5.06786 9.14286 5.5V11.7857C9.14286 12.2179 8.78929 12.5714 8.35714 12.5714H3.64286C3.21071 12.5714 2.85714 12.2179 2.85714 11.7857V5.5C2.85714 5.06786 3.21071 4.71429 3.64286 4.71429ZM8.75 0.785714L8.19214 0.227857C8.05071 0.0864285 7.84643 0 7.64214 0H4.35786C4.15357 0 3.94929 0.0864285 3.80786 0.227857L3.25 0.785714H1.28571C0.853571 0.785714 0.5 1.13929 0.5 1.57143C0.5 2.00357 0.853571 2.35714 1.28571 2.35714H10.7143C11.1464 2.35714 11.5 2.00357 11.5 1.57143C11.5 1.13929 11.1464 0.785714 10.7143 0.785714H8.75Z"
                    />
                  </svg>
                </div>
              </div>

              <span className="ml-3 duration-100 text-light-gray group-hover:text-white">
                Trash
              </span>

            </div>
          </li>
        </ul>

      </div>
    </div>
  );
};
