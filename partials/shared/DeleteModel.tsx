// NOT USED
import { useState, useRef, useEffect } from "react";
import { Transition } from "utils/Transition";

export function DeleteModel({ align }) {
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
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={
          "flex items-center justify-center hover:bg-slate-200 transition duration-150 rounded-full"
        }
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Delete Model</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.88889 18.2222C6.88889 19.2 7.68889 20 8.66667 20H15.7778C16.7556 20 17.5556 19.2 17.5556 18.2222V9.33333C17.5556 8.35556 16.7556 7.55556 15.7778 7.55556H8.66667C7.68889 7.55556 6.88889 8.35556 6.88889 9.33333V18.2222ZM9.55556 9.33333H14.8889C15.3778 9.33333 15.7778 9.73333 15.7778 10.2222V17.3333C15.7778 17.8222 15.3778 18.2222 14.8889 18.2222H9.55556C9.06667 18.2222 8.66667 17.8222 8.66667 17.3333V10.2222C8.66667 9.73333 9.06667 9.33333 9.55556 9.33333ZM15.3333 4.88889L14.7022 4.25778C14.5422 4.09778 14.3111 4 14.08 4H10.3644C10.1333 4 9.90222 4.09778 9.74222 4.25778L9.11111 4.88889H6.88889C6.4 4.88889 6 5.28889 6 5.77778C6 6.26667 6.4 6.66667 6.88889 6.66667H17.5556C18.0444 6.66667 18.4444 6.26667 18.4444 5.77778C18.4444 5.28889 18.0444 4.88889 17.5556 4.88889H15.3333Z"
            fill="white"
          />
        </svg>
      </button>

      <Transition
        className={`origin-top-right z-60 absolute top-full -mr-48 sm:mr-0 min-w-80 bg-primary-dark-blue border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
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
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="text-xs font-semibold text-slate-400 bg-primary-dark-blue uppercase pt-1.5 pb-2 px-4">
            Are you sure you want to delete your model?
          </div>
        </div>
      </Transition>
    </div>
  );
}
