import { useState, useRef, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { showProjectsGridViewAtom } from 'state/ui';
import { projectAtom } from 'state/project';

import ToggleGridOnIcon from 'public/svg/toggle-grid-on.svg';
import ToggleGridOffIcon from 'public/svg/toggle-grid-off.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px]';

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
      // @ts-ignore
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
    <button ref={trigger} className={`${btnClass}`} aria-haspopup="true" aria-expanded={dropdownOpen}>
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
  );
}
