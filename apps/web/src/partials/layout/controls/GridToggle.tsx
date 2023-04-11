import { useState, useRef, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { showProjectsGridViewAtom } from 'state/ui';
import { projectAtom } from 'state/project';

import ToggleGridOnIcon from 'public/svg/toggle-grid-on.svg';
import ToggleGridOffIcon from 'public/svg/toggle-grid-off.svg';

export function GridToggle() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [grid, setGrid] = useRecoilState(showProjectsGridViewAtom);
  const setSelectedProject = useSetRecoilState(projectAtom);
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
        className={'flex items-center justify-center border border-transparent hover:border-white px-0 rounded'}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Grid Toggle</span>
        {!grid ? (
          <ToggleGridOnIcon
            onClick={() => {
              setGrid((prev) => !prev);
              setSelectedProject(null);
            }}
          />
        ) : (
          <ToggleGridOffIcon
            onClick={() => {
              setSelectedProject(null);
              setGrid((prev) => !prev);
            }}
          />
        )}
      </button>
    </div>
  );
}
