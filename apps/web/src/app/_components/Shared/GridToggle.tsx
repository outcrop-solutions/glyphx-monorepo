import {useState, useRef, useEffect} from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {showProjectsGridViewAtom} from 'state/ui';
import {projectAtom} from 'state/project';

export function GridToggle() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [grid, setGrid] = useRecoilState(showProjectsGridViewAtom);
  const setSelectedProject = useSetRecoilState(projectAtom);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({target}) => {
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
        className={'flex items-center justify-center border border-transparent hover:border-white px-0 rounded'}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Grid Toggle</span>
        {!grid ? (
          <svg
            onClick={() => {
              setGrid((prev) => !prev);
              setSelectedProject(null);
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.5 11H9.5C10.325 11 11 10.325 11 9.5V6.5C11 5.675 10.325 5 9.5 5H6.5C5.675 5 5 5.675 5 6.5V9.5C5 10.325 5.675 11 6.5 11Z"
              fill="white"
            />
            <path
              d="M6.5 19H9.5C10.325 19 11 18.325 11 17.5V14.5C11 13.675 10.325 13 9.5 13H6.5C5.675 13 5 13.675 5 14.5V17.5C5 18.325 5.675 19 6.5 19Z"
              fill="white"
            />
            <path
              d="M13 6.5V9.5C13 10.325 13.675 11 14.5 11H17.5C18.325 11 19 10.325 19 9.5V6.5C19 5.675 18.325 5 17.5 5H14.5C13.675 5 13 5.675 13 6.5Z"
              fill="white"
            />
            <path
              d="M14.5 19H17.5C18.325 19 19 18.325 19 17.5V14.5C19 13.675 18.325 13 17.5 13H14.5C13.675 13 13 13.675 13 14.5V17.5C13 18.325 13.675 19 14.5 19Z"
              fill="white"
            />
          </svg>
        ) : (
          <svg
            onClick={() => {
              setSelectedProject(null);
              setGrid((prev) => !prev);
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.88889 14H6.66667C7.15556 14 7.55556 13.6 7.55556 13.1111V11.3333C7.55556 10.8444 7.15556 10.4444 6.66667 10.4444H4.88889C4.4 10.4444 4 10.8444 4 11.3333V13.1111C4 13.6 4.4 14 4.88889 14ZM4.88889 18.4444H6.66667C7.15556 18.4444 7.55556 18.0444 7.55556 17.5556V15.7778C7.55556 15.2889 7.15556 14.8889 6.66667 14.8889H4.88889C4.4 14.8889 4 15.2889 4 15.7778V17.5556C4 18.0444 4.4 18.4444 4.88889 18.4444ZM4.88889 9.55556H6.66667C7.15556 9.55556 7.55556 9.15556 7.55556 8.66667V6.88889C7.55556 6.4 7.15556 6 6.66667 6H4.88889C4.4 6 4 6.4 4 6.88889V8.66667C4 9.15556 4.4 9.55556 4.88889 9.55556ZM9.33333 14H19.1111C19.6 14 20 13.6 20 13.1111V11.3333C20 10.8444 19.6 10.4444 19.1111 10.4444H9.33333C8.84444 10.4444 8.44444 10.8444 8.44444 11.3333V13.1111C8.44444 13.6 8.84444 14 9.33333 14ZM9.33333 18.4444H19.1111C19.6 18.4444 20 18.0444 20 17.5556V15.7778C20 15.2889 19.6 14.8889 19.1111 14.8889H9.33333C8.84444 14.8889 8.44444 15.2889 8.44444 15.7778V17.5556C8.44444 18.0444 8.84444 18.4444 9.33333 18.4444ZM8.44444 6.88889V8.66667C8.44444 9.15556 8.84444 9.55556 9.33333 9.55556H19.1111C19.6 9.55556 20 9.15556 20 8.66667V6.88889C20 6.4 19.6 6 19.1111 6H9.33333C8.84444 6 8.44444 6.4 8.44444 6.88889Z"
              fill="white"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
