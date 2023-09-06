import {useState, useRef, useEffect} from 'react';

export function LinkDropDown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({target}) => {
      if (!dropdown.current) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({keyCode}) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={'flex items-center justify-center  rounded-full'}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Anyone with the link</span>
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.3334 0.666626H8.33337C7.96671 0.666626 7.66671 0.966626 7.66671 1.33329C7.66671 1.69996 7.96671 1.99996 8.33337 1.99996H10.3334C11.4334 1.99996 12.3334 2.89996 12.3334 3.99996C12.3334 5.09996 11.4334 5.99996 10.3334 5.99996H8.33337C7.96671 5.99996 7.66671 6.29996 7.66671 6.66663C7.66671 7.03329 7.96671 7.33329 8.33337 7.33329H10.3334C12.1734 7.33329 13.6667 5.83996 13.6667 3.99996C13.6667 2.15996 12.1734 0.666626 10.3334 0.666626ZM4.33337 3.99996C4.33337 4.36663 4.63337 4.66663 5.00004 4.66663H9.00004C9.36671 4.66663 9.66671 4.36663 9.66671 3.99996C9.66671 3.63329 9.36671 3.33329 9.00004 3.33329H5.00004C4.63337 3.33329 4.33337 3.63329 4.33337 3.99996ZM5.66671 5.99996H3.66671C2.56671 5.99996 1.66671 5.09996 1.66671 3.99996C1.66671 2.89996 2.56671 1.99996 3.66671 1.99996H5.66671C6.03337 1.99996 6.33337 1.69996 6.33337 1.33329C6.33337 0.966626 6.03337 0.666626 5.66671 0.666626H3.66671C1.82671 0.666626 0.333374 2.15996 0.333374 3.99996C0.333374 5.83996 1.82671 7.33329 3.66671 7.33329H5.66671C6.03337 7.33329 6.33337 7.03329 6.33337 6.66663C6.33337 6.29996 6.03337 5.99996 5.66671 5.99996Z"
            fill="#CECECE"
          />
        </svg>

        <div className="ml-1 pl-1 flex items-center justify-center hover:bg-secondary-midnight transition duration-150 rounded-full border border-transparent hover:border-white">
          <span className="mx-1 text-light-gray font-roboto font-medium text-[10px] leading-[11.72px]">
            Anyone with the link
          </span>
        </div>
      </button>
    </div>
  );
}
