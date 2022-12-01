import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Transition } from "utils/Transition";
import React from "react";

export function DropdownNotifications({ align }) {
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

  return (
    <div className="relative inline-flex bg-secondary-space-blue border border-transparent px-2 hover:border-white rounded">
      <button
        ref={trigger}
        className={
          "flex items-center justify-center "
        }
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <svg
          width="13"
          height="16"
          viewBox="0 0 13 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.2063 12.1354L11.1479 11.0769V6.97436C11.1479 4.45538 9.80224 2.34667 7.45557 1.78872V1.23077C7.45557 0.549744 6.90583 0 6.2248 0C5.54378 0 4.99403 0.549744 4.99403 1.23077V1.78872C2.63916 2.34667 1.30172 4.44718 1.30172 6.97436V11.0769L0.243263 12.1354C-0.27366 12.6523 0.0873658 13.5385 0.817622 13.5385H11.6238C12.3622 13.5385 12.7233 12.6523 12.2063 12.1354ZM9.50685 11.8974H2.94275V6.97436C2.94275 4.93949 4.18173 3.28205 6.2248 3.28205C8.26788 3.28205 9.50685 4.93949 9.50685 6.97436V11.8974ZM6.2248 16C7.12737 16 7.86583 15.2615 7.86583 14.359H4.58378C4.58378 15.2615 5.31403 16 6.2248 16Z"
            fill="white"
          />
        </svg>
      </button>
      {/* NOTIFICATION LIST */}
      <Transition
      appear={null}
        className={`origin-top-right absolute top-full -mr-48 sm:mr-0 min-w-80 border bg-primary-dark-blue border-gray py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          className="bg-primary-dark-blue"
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="text-xs bg-primary-dark-blue font-semibold text-gray uppercase pt-1.5 pb-2 px-4">
            Notifications
          </div>
          <ul>
            <li className="border-b bg-primary-dark-blue z-60 border-gray last:border-0">
              <Link href="#0">
                <a
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="block py-2 px-4 hover:bg-gray"
                >
                  <span className="block text-sm mb-2">
                    📣{" "}
                    <span className="font-medium text-white">
                      Edit your information in a swipe
                    </span>{" "}
                    Sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim.
                  </span>
                  <span className="block text-xs font-medium text-gray">
                    Feb 12, 2021
                  </span>
                </a>
              </Link>
            </li>
            <li className="border-b bg-primary-dark-blue z-60 border-gray last:border-0">
              <Link href="#0">
                <a
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="block py-2 px-4 hover:bg-gray"
                >
                  <span className="block text-sm mb-2">
                    📣{" "}
                    <span className="font-medium text-white">
                      Edit your information in a swipe
                    </span>{" "}
                    Sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim.
                  </span>
                  <span className="block text-xs font-medium text-gray">
                    Feb 12, 2021
                  </span>
                </a>
              </Link>
            </li>
            <li className="border-b bg-primary-dark-blue z-60 border-gray last:border-0">
              <Link href="#0">
                <a
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="block py-2 px-4 hover:bg-gray"
                >
                  <span className="block text-sm mb-2">
                    📣{" "}
                    <span className="font-medium text-white">
                      Edit your information in a swipe
                    </span>{" "}
                    Sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim.
                  </span>
                  <span className="block text-xs font-medium text-gray">
                    Feb 12, 2021
                  </span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}
