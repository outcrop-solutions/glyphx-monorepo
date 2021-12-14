import { useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
export const RangeFilter = ({ filtersApplied, setFiltersApplied }) => {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  //TODO: useEffect hook to show any previously applied filters
  const handleMin = (e) => {
    setMin(e.target.value);
  };
  const handleMax = (e) => {
    setMax(e.target.value);
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
      </div>
    // </ClickAwayListener>
  );
};
