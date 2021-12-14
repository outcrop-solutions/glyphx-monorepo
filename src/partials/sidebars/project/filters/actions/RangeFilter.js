import React from "react";

export const RangeFilter = () => {
  return (
    <div className="py-2 mx-2 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <div className="">
          <input
            type="number"
            name="min"
            placeholder="000"
            id="min"
            autoComplete="number"
            className="bg-transparent h-6 text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-600"
          />
        </div>
      </div>

      <div className="sm:col-span-3">
        <div className="">
          <input
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
  );
};
