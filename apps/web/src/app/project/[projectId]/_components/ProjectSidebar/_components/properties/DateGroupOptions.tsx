'use client';
import React, {useState} from 'react';
import {ChevronRightIcon} from '@heroicons/react/outline';
import {Switch} from '@headlessui/react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const DateGroupOptions = ({grouping, selected, setDirty}) => {
  const [doy, setDoy] = useState(true);
  const [month, setMonth] = useState(true);
  const [dom, setDom] = useState({year: true, month: true});
  const [dow, setDow] = useState(true);
  const [woy, setWoy] = useState(true);
  const [quarter, setQuarter] = useState(true);

  return (
    <div className="relative flex-col mx-2">
      <div className="flex items-center space-x-2">
        <span className={`block truncate text-white text-[10px] ${selected ? 'font-medium' : 'font-normal'}`}>
          {grouping}
        </span>
        <ChevronRightIcon className="h-2 w-2" />
      </div>
      <div className={`hidden group-hover/option:flex z-90`}>
        {(() => {
          switch (grouping) {
            case 'DAY OF YEAR':
              return (
                <div className="flex items-center">
                  <Toggle
                    grouping={grouping}
                    value={doy}
                    onChange={(val) => {
                      setDoy(val);
                      setDirty(true);
                    }}
                  />
                  <div className="text-[8px]">YEAR</div>
                </div>
              );
            case 'MONTH':
              return (
                <div className="flex items-center">
                  <Toggle
                    grouping={grouping}
                    value={month}
                    onChange={(val) => {
                      setMonth(val);
                      setDirty(true);
                    }}
                  />
                  <div className="text-[8px]">YEAR</div>
                </div>
              );
            case 'DAY OF MONTH':
              return (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Toggle
                      grouping={grouping}
                      value={dom.month}
                      onChange={(val: boolean) => {
                        setDirty(true);
                        setDom(
                          // @ts-ignore
                          produce((draft: WritableDraft<boolean>) => {
                            // @ts-ignore
                            draft.month = val;
                          })
                        );
                      }}
                    />
                    <div className="text-[8px]">MONTH</div>
                  </div>
                  <div className="flex items-center">
                    <Toggle
                      grouping={grouping}
                      value={dom.year}
                      onChange={(val: boolean) => {
                        setDirty(true);
                        setDom(
                          // @ts-ignore
                          produce((draft: WritableDraft<boolean>) => {
                            // @ts-ignore
                            draft.year = val;
                          })
                        );
                      }}
                    />
                    <div className="text-[8px]">YEAR</div>
                  </div>
                </div>
              );
            case 'DAY OF WEEK':
              return (
                <div className="flex items-center">
                  <Toggle
                    grouping={grouping}
                    value={dow}
                    onChange={(val) => {
                      setDow(val);
                      setDirty(true);
                    }}
                  />
                  <div className="text-[8px]">YEAR</div>
                </div>
              );
            case 'WEEK OF YEAR':
              return (
                <div className="flex items-center">
                  <Toggle
                    grouping={grouping}
                    value={woy}
                    onChange={(val) => {
                      setWoy(val);
                      setDirty(true);
                    }}
                  />
                  <div className="text-[8px]">YEAR</div>
                </div>
              );
            case 'QUARTER':
              return (
                <div className="flex items-center">
                  <Toggle
                    grouping={grouping}
                    value={quarter}
                    onChange={(val) => {
                      setQuarter(val);
                      setDirty(true);
                    }}
                  />
                  <div className="text-[8px]">YEAR</div>
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
};

const Toggle = ({grouping, value, onChange}) => {
  const handleClick = (event) => {
    // console.log('clicked');
    event.stopPropagation(); // This prevents the click from propagating up to the listbox
    // onChange(); // Call the onChange handler
  };
  return (
    <div className="py-2 z-90 mr-1" onClick={handleClick}>
      <input
        id={grouping}
        name={grouping}
        type="checkbox"
        checked={value}
        onChange={(event) => {
          event.stopPropagation(); // This also prevents the click from propagating up to the listbox
          onChange(event.target.checked); // You need to pass the new checked state
        }}
        className="h-3 w-3 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
      />
    </div>
  );
};
