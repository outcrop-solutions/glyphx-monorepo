import React, { useState, useRef, useEffect } from "react";
import Transition from "../utils/Transition";
import { Auth } from "aws-amplify";
export const UserMenu = ({ align, user, setIsLoggedIn }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const signOut = async () => {
    try {
      await Auth.signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.log("error sigingin out" + error);
    }
  };
  return (
    <div className="relative">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group pl-8 main-sidebar-expanded:pl-0"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        {/* <img className="w-8 h-8 rounded-full" src={UserAvatar} width="32" height="32" alt="User" /> */}
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
        <div className="flex items-center truncate">
          <span className="truncate w-2/3 ml-2 text-sm text-white font-sans font-medium group-hover:text-gray-400">
            {user.attributes
              ? user.attributes.name
                ? user.attributes.name
                : user.attributes.email
                ? user.attributes.email
                : ""
              : ""}
          </span>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-2/3 bg-gray-900 border border-gray-800 py-1.5 rounded shadow-lg overflow-hidden mt-1 -right-4`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <ul
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <li>
            <a
              className="font-medium text-sm text-gray-200 hover:text-gray-800 block py-1.5 px-3"
              href="/settings"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow flex items-center truncate">
                  {/* <img className="w-7 h-7 rounded-full mr-2" src={DropdownImage01} width="28" height="28" alt="Channel 01" /> */}
                  <div className="truncate">Settings</div>
                </div>
              </div>
            </a>
          </li>
          <li>
            <a
              className="font-medium text-sm text-gray-200 hover:text-gray-800 block py-1.5 px-3"
              href="#0"
              onClick={() => {
                signOut();
                setDropdownOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow flex items-center truncate">
                  {/* <img className="w-7 h-7 rounded-full mr-2" src={DropdownImage02} width="28" height="28" alt="Channel 02" /> */}
                  <div className="truncate">Log out</div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </Transition>
    </div>
  );
};
