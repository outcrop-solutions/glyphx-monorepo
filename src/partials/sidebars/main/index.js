import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import UserMenu from "../../../components/UserMenu";

export const MainSidebar = ({
  user,
  sidebarOpen,
  setSidebarOpen,
  setProject,
}) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="bg-gray-800">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}

      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-screen overflow-y-scroll lg:overflow-y-auto scrollbar-none w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-2 pr-3 sm:px-2 border-b border-gray-400 pb-4">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink exact to="/" className="flex">
            <svg
              width="11"
              height="20"
              viewBox="0 0 11 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.69836 10.0902H4.69851C5.71133 10.089 6.68279 9.69376 7.39968 8.99053C8.11666 8.28722 8.52046 7.33317 8.52171 6.33749V6.33733C8.52171 5.59454 8.29716 4.86864 7.87674 4.25143C7.45634 3.63425 6.85906 3.15357 6.16071 2.86982C5.46238 2.58608 4.69409 2.51188 3.9529 2.6565C3.2117 2.80112 2.53055 3.15815 1.99569 3.68281C1.46081 4.2075 1.09627 4.87628 0.948558 5.60473C0.800842 6.33319 0.876678 7.08823 1.16637 7.77427C1.45605 8.46029 1.94643 9.04624 2.57514 9.45832C3.20382 9.87039 3.9427 10.0902 4.69836 10.0902ZM4.72469 4.02504H4.84969V4.02375C5.12204 4.0377 5.39024 4.09717 5.64262 4.19985C5.93354 4.31821 6.19765 4.49161 6.4199 4.71002C6.64215 4.92843 6.81818 5.18756 6.93804 5.47251C7.0579 5.75745 7.11927 6.06269 7.11869 6.37079V6.37102C7.11869 6.83447 6.97861 7.28772 6.71586 7.67346C6.45309 8.05923 6.07934 8.36026 5.64162 8.53811C5.20387 8.71597 4.72206 8.76255 4.2572 8.67184C3.79235 8.58114 3.36568 8.35732 3.03102 8.02904C2.69639 7.70079 2.46878 7.28286 2.3766 6.82825C2.28441 6.37365 2.3317 5.90242 2.51259 5.47404C2.69349 5.04564 3 4.67909 3.39373 4.42102C3.78749 4.16293 4.25067 4.02504 4.72469 4.02504ZM4.69836 19.125H4.82336V19.1184C5.79007 19.0863 6.71078 18.6958 7.39801 18.0225C8.11485 17.3202 8.5192 16.3673 8.52171 15.3725V15.3721C8.52171 14.6294 8.29716 13.9035 7.87674 13.2862C7.45634 12.6691 6.85906 12.1884 6.16071 11.9046C5.46238 11.6209 4.69409 11.5467 3.9529 11.6913C3.2117 11.8359 2.53055 12.193 1.99569 12.7176C1.46081 13.2423 1.09627 13.9111 0.948558 14.6395C0.800842 15.368 0.876678 16.1231 1.16637 16.8091C1.45605 17.4951 1.94643 18.0811 2.57514 18.4931C3.20382 18.9052 3.9427 19.125 4.69836 19.125ZM4.69836 13.0677H4.82336V13.0666C5.40287 13.0973 5.95183 13.3369 6.36336 13.7411C6.80433 14.1743 7.05143 14.761 7.05114 15.3721V15.3722C7.05135 15.8277 6.91387 16.2732 6.65578 16.6525C6.39766 17.0317 6.03044 17.3277 5.60026 17.5027C5.17007 17.6777 4.69651 17.7236 4.23957 17.6346C3.78265 17.5455 3.36322 17.3257 3.03422 17.0031C2.70524 16.6805 2.48145 16.2698 2.39077 15.823C2.30009 15.3762 2.3465 14.9131 2.52423 14.492C2.70198 14.0709 3.00321 13.7106 3.39018 13.457C3.77719 13.2033 4.23244 13.0677 4.69836 13.0677ZM9.22834 0.875003L9.22822 0.875002C8.97339 0.874511 8.72394 0.948178 8.51144 1.08694C8.29891 1.22573 8.13275 1.42349 8.03438 1.65548C7.936 1.8875 7.90996 2.14308 7.95966 2.38977C8.00936 2.63644 8.13248 2.86277 8.31305 3.04025C8.49359 3.2177 8.72346 3.33836 8.97342 3.38732C9.22338 3.43628 9.48254 3.41142 9.71822 3.31579C9.95392 3.22016 10.1558 3.05792 10.298 2.84926C10.4402 2.64056 10.5163 2.39491 10.5163 2.14339V2.14327C10.516 1.80665 10.3797 1.48438 10.138 1.24687C9.89643 1.00943 9.56929 0.875987 9.22834 0.875003Z"
                fill="#FFC500"
                stroke="#FFC500"
                stroke-width="0.25"
              />
            </svg>
            <span className="hidden font-sans sidebar-expanded:block 2xl:hidden capitalize text-2xl text-white font-light">
              GLYPH
            </span>
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <div className="text-xs uppercase text-gray-500 font-semibold border-b pb-2 border-white flex justify-center lg:sidebar-expanded:justify-start lg:sidebar-expanded:ml-3 items-center">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
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
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                <UserMenu user={user} />
              </span>
            </div>
            <ul className="mt-3">
              {/* Dashboard */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname === "/" && "bg-gray-900"
                }`}
              >
                <NavLink
                  exact
                  to="/"
                  onClick={() => {
                    setProject(false);
                  }}
                  className={`block text-gray-200 hover:text-white truncate transition duration-150 ${
                    pathname === "/" && "hover:text-gray-200"
                  }`}
                >
                  <div className="flex">
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
                          fill="white"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      My Projects
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("shared") && "bg-gray-900"
                }`}
              >
                <NavLink
                  exact
                  to="/shared"
                  className={`block text-gray-200 hover:text-white truncate transition duration-150 ${
                    pathname.includes("shared") && "hover:text-gray-200"
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
                          fill="white"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Shared with Me
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("shared") && "bg-gray-900"
                }`}
              >
                <NavLink
                  exact
                  to="/drafts"
                  className={`block text-gray-200 hover:text-white truncate transition duration-150 ${
                    pathname.includes("shared") && "hover:text-gray-200"
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
                          d="M13.5 4H7.5C6.675 4 6.0075 4.675 6.0075 5.5L6 17.5C6 18.325 6.6675 19 7.4925 19H16.5C17.325 19 18 18.325 18 17.5V8.5L13.5 4ZM7.5 17.5V5.5H12.75V9.25H16.5V17.5H7.5Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    {/* <svg className='flex-shrink-0 h-6 w-6' viewBox='0 0 24 24'>
											<path
												className={`fill-current text-gray-600 ${
													pathname.includes('shared') && 'text-indigo-500'
												}`}
												d='M0 20h24v2H0z'
											/>
											<path
												className={`fill-current text-gray-400 ${
													pathname.includes('shared') && 'text-indigo-300'
												}`}
												d='M4 18h2a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v9a1 1 0 001 1zM11 18h2a1 1 0 001-1V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v14a1 1 0 001 1zM17 12v5a1 1 0 001 1h2a1 1 0 001-1v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1z'
											/>
										</svg> */}
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Drafts
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Analytics */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("shared") && "bg-gray-900"
                }`}
              >
                <NavLink
                  exact
                  to="/trash"
                  className={`block text-gray-200 hover:text-white truncate transition duration-150 ${
                    pathname.includes("shared") && "hover:text-gray-200"
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
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Trash
                    </span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="px-3 py-2">
            <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="w-6 h-6 fill-current sidebar-expanded:rotate-180"
                viewBox="0 0 24 24"
              >
                <path
                  className="text-gray-400"
                  d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z"
                />
                <path className="text-gray-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
