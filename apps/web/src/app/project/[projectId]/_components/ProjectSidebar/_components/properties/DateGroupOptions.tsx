'use client';
import React, {useState} from 'react';
import {ChevronRightIcon} from '@heroicons/react/outline';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {useRecoilState} from 'recoil';
import {dayAtom, domAtom, dowAtom, monthAtom, quarterAtom, woyAtom} from 'state';

export const DateGroupOptions = ({grouping, selected}) => {
  const [doy, setDoy] = useRecoilState(dayAtom);
  const [month, setMonth] = useRecoilState(monthAtom);
  const [dom, setDom] = useRecoilState(domAtom);
  const [dow, setDow] = useRecoilState(dowAtom);
  const [woy, setWoy] = useRecoilState(woyAtom);
  const [quarter, setQuarter] = useRecoilState(quarterAtom);

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
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Toggle
                      grouping={grouping}
                      value={dow.year}
                      onChange={(val: boolean) => {
                        setDow(
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
                  <div className="flex items-center">
                    <Toggle
                      grouping={grouping}
                      value={dow.week}
                      onChange={(val: boolean) => {
                        setDow(
                          // @ts-ignore
                          produce((draft: WritableDraft<boolean>) => {
                            // @ts-ignore
                            draft.week = val;
                          })
                        );
                      }}
                    />
                    <div className="text-[8px]">WEEK</div>
                  </div>
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
    event.stopPropagation(); // This prevents the click from propagating up to the listbox
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
          onChange(event.target.checked);
        }}
        className="h-3 w-3 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
      />
    </div>
  );
};
