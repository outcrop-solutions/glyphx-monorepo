import { useState, useEffect, useRef } from "react";
import { ExpandCollapse } from "./ExpandCollapse";
import { UserMenu } from "partials";
import { useRouter } from "next/router";
import Link from "next/link";
export const MainSidebar = ({ user, project }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const { pathname } = router;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    if (project) {
      setSidebarExpanded(false);
    } else {
      setSidebarExpanded(true);
    }
  }, [project]);
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

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`hidden lg:flex flex-col absolute z-40 bg-secondary-dark-blue left-0 top-0 lg:static lg:left-auto lg:top-auto h-screen overflow-y-scroll lg:overflow-y-auto scrollbar-none w-64 lg:w-20 lg:main-sidebar-expanded:!w-64 shrink-0 p-4`}
    >
      <div>
        {/* Sidebar header */}
        <div className="flex justify-between mb-2 pr-3 sm:px-2 border-b border-slate-400 py-3">
          {/* Logo */}
          <div className="flex">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#1F273A" />
              <path
                d="M11.6984 12.0902H11.6985C12.7113 12.089 13.6828 11.6938 14.3997 10.9905C15.1167 10.2872 15.5205 9.33317 15.5217 8.33749V8.33733C15.5217 7.59454 15.2972 6.86864 14.8767 6.25143C14.4563 5.63425 13.8591 5.15357 13.1607 4.86982C12.4624 4.58608 11.6941 4.51188 10.9529 4.6565C10.2117 4.80112 9.53055 5.15815 8.99569 5.68281C8.46081 6.2075 8.09627 6.87628 7.94856 7.60473C7.80084 8.33319 7.87668 9.08823 8.16637 9.77427C8.45605 10.4603 8.94643 11.0462 9.57514 11.4583C10.2038 11.8704 10.9427 12.0902 11.6984 12.0902ZM11.7247 6.02504H11.8497V6.02375C12.122 6.0377 12.3902 6.09717 12.6426 6.19985C12.9335 6.31821 13.1976 6.49161 13.4199 6.71002C13.6422 6.92843 13.8182 7.18756 13.938 7.47251C14.0579 7.75745 14.1193 8.06269 14.1187 8.37079V8.37102C14.1187 8.83447 13.9786 9.28772 13.7159 9.67346C13.4531 10.0592 13.0793 10.3603 12.6416 10.5381C12.2039 10.716 11.7221 10.7625 11.2572 10.6718C10.7923 10.5811 10.3657 10.3573 10.031 10.029C9.69639 9.70079 9.46878 9.28286 9.3766 8.82825C9.28441 8.37365 9.3317 7.90242 9.51259 7.47404C9.69349 7.04564 10 6.67909 10.3937 6.42102C10.7875 6.16293 11.2507 6.02504 11.7247 6.02504ZM11.6984 21.125H11.8234V21.1184C12.7901 21.0863 13.7108 20.6958 14.398 20.0225C15.1149 19.3202 15.5192 18.3673 15.5217 17.3725V17.3721C15.5217 16.6294 15.2972 15.9035 14.8767 15.2862C14.4563 14.6691 13.8591 14.1884 13.1607 13.9046C12.4624 13.6209 11.6941 13.5467 10.9529 13.6913C10.2117 13.8359 9.53055 14.193 8.99569 14.7176C8.46081 15.2423 8.09627 15.9111 7.94856 16.6395C7.80084 17.368 7.87668 18.1231 8.16637 18.8091C8.45605 19.4951 8.94643 20.0811 9.57514 20.4931C10.2038 20.9052 10.9427 21.125 11.6984 21.125ZM11.6984 15.0677H11.8234V15.0666C12.4029 15.0973 12.9518 15.3369 13.3634 15.7411C13.8043 16.1743 14.0514 16.761 14.0511 17.3721V17.3722C14.0514 17.8277 13.9139 18.2732 13.6558 18.6525C13.3977 19.0317 13.0304 19.3277 12.6003 19.5027C12.1701 19.6777 11.6965 19.7236 11.2396 19.6346C10.7826 19.5455 10.3632 19.3257 10.0342 19.0031C9.70524 18.6805 9.48145 18.2698 9.39077 17.823C9.30009 17.3762 9.3465 16.9131 9.52423 16.492C9.70198 16.0709 10.0032 15.7106 10.3902 15.457C10.7772 15.2033 11.2324 15.0677 11.6984 15.0677ZM16.2283 2.875L16.2282 2.875C15.9734 2.87451 15.7239 2.94818 15.5114 3.08694C15.2989 3.22573 15.1328 3.42349 15.0344 3.65548C14.936 3.8875 14.91 4.14308 14.9597 4.38977C15.0094 4.63644 15.1325 4.86277 15.313 5.04025C15.4936 5.2177 15.7235 5.33836 15.9734 5.38732C16.2234 5.43628 16.4825 5.41142 16.7182 5.31579C16.9539 5.22016 17.1558 5.05792 17.298 4.84926C17.4402 4.64056 17.5163 4.39491 17.5163 4.14339V4.14327C17.516 3.80665 17.3797 3.48438 17.138 3.24687C16.8964 3.00943 16.5693 2.87599 16.2283 2.875Z"
                fill="#FFC500"
                stroke="#FFC500"
                strokeWidth="0.25"
              />
            </svg>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-8 mt-1">
          {/* Pages group */}
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold border-b pb-2 border-white flex justify-center lg:main-sidebar-expanded:justify-start lg:main-sidebar-expanded:ml-3 items-center">
              <span
                className="hidden lg:block lg:main-sidebar-expanded:hidden text-center w-6"
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
              <span className="lg:hidden main-sidebar-expanded:block">
                <UserMenu align="right" user={user} />
              </span>
            </div>
            <ul className="mt-3">
              {/* HOME */}
              <li
                className={`px-3 py-1 rounded-full mb-0.5 last:mb-0 ${
                  pathname === "/" && "bg-slate-800"
                }`}
              >
                <Link
                  href="/home"
                  onClick={() => {
                    // @ts-ignore
                    if (window && window.core) {
                      // @ts-ignore
                      window.core.CloseModel();
                    }
                    router.push("/home");
                  }}
                >
                  <a
                    className={`block text-slate-200 hover:text-white truncate transition duration-150 ${
                      pathname === "/" && "hover:text-slate-200"
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

                      <span className="text-sm font-medium ml-3 lg:opacity-0 lg:main-sidebar-expanded:opacity-100 duration-200">
                        My Projects
                      </span>
                    </div>
                  </a>
                </Link>
              </li>
              {/* SHARED WITH ME */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("shared") && "bg-slate-800"
                }`}
              >
                <div
                  className={`block text-slate-500 truncate transition duration-150 ${
                    pathname.includes("shared") && "hover:text-slate-200"
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
                          fill="gray"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:main-sidebar-expanded:opacity-100 duration-200">
                      Shared with Me
                    </span>
                  </div>
                </div>
              </li>
              {/* DRAFTS */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("drafts") && "bg-primary-dark-blue"
                }`}
              >
                <div
                  className={`block text-slate-500 truncate transition duration-150 ${
                    pathname.includes("drafts") && "hover:text-slate-200"
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
                          fill="gray"
                        />
                      </svg>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:main-sidebar-expanded:opacity-100 duration-200">
                      Drafts
                    </span>
                  </div>
                </div>
              </li>
              {/* TRASH */}
              <li
                className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
                  pathname.includes("shared") && "bg-primary-dark-blue"
                }`}
              >
                <a
                  href="/trash"
                  className={`block text-slate-500 truncate transition duration-150 ${
                    pathname.includes("shared") && "hover:text-slate-200"
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
                            fill="gray"
                          />
                        </svg>
                      </div>
                    </div>

                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:main-sidebar-expanded:opacity-100 duration-200">
                      Trash
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="sticky bottom-0">
          <ExpandCollapse
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
        </div>
      </div>
    </div>
  );
};
