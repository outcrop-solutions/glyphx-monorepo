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
        "block text-gray-200 hover:text-white truncate border-b border-gray-400 transition duration-150"
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
            <div className="flex flex-shrink-0 ml-2">
              <svg
                className={`w-3 h-3 flex-shrink-0 ml-1 fill-current transform text-gray-400 ${
                  open ? "rotate-0" : "-rotate-90"
                }`}
                viewBox="0 0 12 12"
              >
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </div>
            <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              Files
            </span>
            <div className="pr-4">
              <svg
                // onClick={addState}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.1429 8.85714H8.85714V13.1429C8.85714 13.6143 8.47143 14 8 14C7.52857 14 7.14286 13.6143 7.14286 13.1429V8.85714H2.85714C2.38571 8.85714 2 8.47143 2 8C2 7.52857 2.38571 7.14286 2.85714 7.14286H7.14286V2.85714C7.14286 2.38571 7.52857 2 8 2C8.47143 2 8.85714 2.38571 8.85714 2.85714V7.14286H13.1429C13.6143 7.14286 14 7.52857 14 8C14 8.47143 13.6143 8.85714 13.1429 8.85714Z"
                  fill="#595E68"
                />
              </svg>
            </div>
          </>
        ) : (
          <div className="flex flex-shrink-0">
            <svg
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 256 256"
            >
              <path
                d="M213.657 66.343l-40-40A8 8 0 0 0 168 24H88a16.018 16.018 0 0 0-16 16v16H56a16.018 16.018 0 0 0-16 16v144a16.018 16.018 0 0 0 16 16h112a16.018 16.018 0 0 0 16-16v-16h16a16.018 16.018 0 0 0 16-16V72a8 8 0 0 0-2.343-5.657zM136 192H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm0-32H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm64 24h-16v-80a8 8 0 0 0-2.343-5.657l-40-40A8 8 0 0 0 136 56H88V40h76.687L200 75.314z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </div>
    </a>
  );
};
