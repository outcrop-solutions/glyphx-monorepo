import React from "react";

export const Header = ({
  open,
  sidebarExpanded,
  setSidebarExpanded,
  handleClick,
}) => {
  return (
    <a
      href="#0"
      className={
        "block text-slate-200 hover:text-white truncate border-b border-slate-400 transition duration-150"
      }
      onClick={(e) => {
        e.preventDefault();
        sidebarExpanded ? handleClick() : setSidebarExpanded(true);
      }}
    >
      <div
        className={`flex items-center h-11 ${
          !sidebarExpanded ? "justify-center w-full" : ""
        }`}
      >
        {/* Icon */}
        {sidebarExpanded ? (
          <>
            <div className="flex shrink-0 ml-2">
              <svg
                className={`w-3 h-3 shrink-0 ml-1 fill-current transform text-slate-400 ${
                  open ? "rotate-0" : "-rotate-90"
                }`}
                viewBox="0 0 12 12"
              >
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </div>
            <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              Properties
            </span>
          </>
        ) : (
          <div className="flex shrink-0">
            <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.27956 7C4.86535 7 4.52956 6.66421 4.52956 6.25V0.75C4.52956 0.335786 4.86535 -1.81058e-08 5.27956 0C5.69378 1.81058e-08 6.02956 0.335786 6.02956 0.75V6.25C6.02956 6.66421 5.69378 7 5.27956 7Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.121085 9.621C-0.104512 9.27361 -0.00577992 8.80911 0.341609 8.58351L4.9543 5.588C5.30169 5.3624 5.76618 5.46113 5.99178 5.80852C6.21738 6.15591 6.11864 6.62041 5.77126 6.84601L1.15857 9.84152C0.811179 10.0671 0.346682 9.96839 0.121085 9.621Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.6211 9.629C10.3955 9.97639 9.93099 10.0751 9.5836 9.84953L4.97091 6.85401C4.62353 6.62842 4.52479 6.16392 4.75039 5.81653C4.97599 5.46914 5.44048 5.37041 5.78787 5.59601L10.4006 8.59152C10.748 8.81712 10.8467 9.28161 10.6211 9.629Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </div>
    </a>
  );
};
