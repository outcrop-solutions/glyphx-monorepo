import { findAllByTestId } from "@testing-library/react";
import { useState, useEffect } from "react";
export const RangeFilter = ({
  lastDroppedItem,
  filtersApplied,
  setFiltersApplied,
}) => {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [applied, setApplied] = useState(false);

  //TODO: useEffect hook to show any previously applied filters
  const handleMin = (e) => {
    setMin(e.target.value);
  };
  const handleMax = (e) => {
    setMax(e.target.value);
  };
  const handleApply = () => {
    setFiltersApplied((prev) => {
      if (applied) {
        let newArr = prev.filter((el) => el.name !== lastDroppedItem.key);
        return [...newArr];
      } else {
        let newArr = [...prev, { name: lastDroppedItem.key, min, max }];
        return [...newArr];
      }
    });
    setApplied((prev) => !prev);
  };
  // const handleSave = () => {

  // };
  return (
    // <ClickAwayListener onClickAway={handleSave}>
    <div className="py-2 mx-2 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <div className="">
          <input
            type="number"
            name="min"
            placeholder="000"
            id="min"
            onChange={handleMin}
            value={min}
            autoComplete="number"
            className="bg-transparent h-6 text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-600"
          />
        </div>
      </div>

      <div className="sm:col-span-3">
        <div className="">
          <input
            onChange={handleMax}
            value={max}
            type="number"
            name="max"
            id="max"
            placeholder="000"
            autoComplete="number"
            className="bg-transparent h-6 text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-600"
          />
        </div>
      </div>
      <div
        onClick={handleApply}
        className="flex items-center justify-center h-6 w-6"
      >
        {applied ? (
          <svg
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <g fill="none">
              <path
                d="M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19c-4.182 0-7.764-4.013-9.257-5.962a1.692 1.692 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5c4.182 0 7.764 4.013 9.257 5.962z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M508 624a112 112 0 0 0 112-112c0-3.28-.15-6.53-.43-9.74L498.26 623.57c3.21.28 6.45.43 9.74.43zm370.72-458.44L836 122.88a8 8 0 0 0-11.31 0L715.37 232.23Q624.91 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 0 0 0 51.5q56.7 119.43 136.55 191.45L112.56 835a8 8 0 0 0 0 11.31L155.25 889a8 8 0 0 0 11.31 0l712.16-712.12a8 8 0 0 0 0-11.32zM332 512a176 176 0 0 1 258.88-155.28l-48.62 48.62a112.08 112.08 0 0 0-140.92 140.92l-48.62 48.62A175.09 175.09 0 0 1 332 512z"
              fill="#595e68"
            />
            <path
              d="M942.2 486.2Q889.4 375 816.51 304.85L672.37 449A176.08 176.08 0 0 1 445 676.37L322.74 798.63Q407.82 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 0 0 0-51.5z"
              fill="#595e68"
            />
          </svg>
        )}
      </div>
    </div>
    // </ClickAwayListener>
  );
};
