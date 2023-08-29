// NOT USED
import { useState, useRef, useEffect } from 'react';
import { Transition } from 'utils/Transition';

export function DropdownFilter({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <div className="hidden md:relative md:inline-flex">
      <button
        ref={trigger}
        className="btn bg-transparentborder-gray text-white"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Filter</span>
        <wbr />
        <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
          <path d="M9 15H7a1 1 0 010-2h2a1 1 0 010 2zM11 11H5a1 1 0 010-2h6a1 1 0 010 2zM13 7H3a1 1 0 010-2h10a1 1 0 010 2zM15 3H1a1 1 0 010-2h14a1 1 0 010 2z" />
        </svg>
      </button>
      <Transition
        appear={null}
        show={dropdownOpen}
        tag="div"
        className={`origin-top-right z-10 absolute top-full min-w-56 border border-gray pt-1.5 rounded shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown}>
          <div className="text-xs font-semibold text-gray uppercase pt-1.5 pb-2 px-4">Filters</div>
          <ul className="mb-4">
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Direct VS Indirect</span>
              </label>
            </li>
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Real Time Value</span>
              </label>
            </li>
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Top Channels</span>
              </label>
            </li>
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Sales VS Refunds</span>
              </label>
            </li>
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Last Order</span>
              </label>
            </li>
            <li className="py-1 px-3">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm font-medium ml-2">Total Spent</span>
              </label>
            </li>
          </ul>
          <div className="py-2 px-3 border-t border-gray bg-gray">
            <ul className="flex items-center justify-between">
              <li>
                <button className="btn-xs border-gray hover:border-slate-300 text-gray hover:text-gray">Clear</button>
              </li>
              <li>
                <button
                  className="btn-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={() => setDropdownOpen(false)}
                  onBlur={() => setDropdownOpen(false)}
                >
                  Apply
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  );
}
