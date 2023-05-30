import { useState, useRef, useEffect } from 'react';
import { Transition } from 'utils/Transition';

export function LinkDropDown({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
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
      </button>
    </div>
  );
}
