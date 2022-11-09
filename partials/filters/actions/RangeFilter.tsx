import React, { useState } from "react";

export const RangeFilter = ({ min, max, setMin, setMax }) => {
  const [showVisibility, setVisibility] = useState(false); //true means eye with no dash, false means eye with dash
  const [ishover, setHover] = useState(false);


  function showHidden() {
    setHover(true);
  }

  function hideHidden() {
    setHover(false);
  }

  return (
    <div
      onMouseOver={showHidden}
      onMouseOut={hideHidden}
      className="group flex flex-row hover:bg-secondary-midnight space-x-2 py-1 items-center justify-center">

      {
        ishover ?
          <div onClick={() => { setVisibility(!showVisibility) }} className="rounded-full border-2 border-transparent bg-secondary-space-blue hover:border-white">
            {
              !showVisibility ?
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4.98136C9.50545 4.98136 10.7273 6.20318 10.7273 7.70864C10.7273 7.98682 10.6727 8.25409 10.5964 8.505L12.2655 10.1741C13.0236 9.50318 13.6236 8.66318 14 7.70318C13.0564 5.31409 10.7273 3.61773 8 3.61773C7.30727 3.61773 6.64182 3.72682 6.01455 3.92864L7.19818 5.11227C7.45455 5.03591 7.72182 4.98136 8 4.98136ZM2.93273 3.15955C2.72 3.37227 2.72 3.71591 2.93273 3.92864L4.00727 5.00318C3.12364 5.70682 2.42 6.63409 2 7.70864C2.94364 10.1032 5.27273 11.7995 8 11.7995C8.82909 11.7995 9.62 11.6359 10.3509 11.3523L11.8345 12.8359C12.0473 13.0486 12.3909 13.0486 12.6036 12.8359C12.8164 12.6232 12.8164 12.2795 12.6036 12.0668L3.70727 3.15955C3.49455 2.94682 3.14545 2.94682 2.93273 3.15955ZM8 10.4359C6.49455 10.4359 5.27273 9.21409 5.27273 7.70864C5.27273 7.28864 5.37091 6.89045 5.54 6.54136L6.39636 7.39773C6.38 7.49591 6.36364 7.59955 6.36364 7.70864C6.36364 8.61409 7.09455 9.345 8 9.345C8.10909 9.345 8.20727 9.32864 8.31091 9.30682L9.16727 10.1632C8.81273 10.3377 8.42 10.4359 8 10.4359ZM9.62 7.52864C9.53818 6.765 8.93818 6.17045 8.18 6.08864L9.62 7.52864Z" fill="white" />
                </svg>
                :
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3.41333C5.27273 3.41333 2.94364 5.22278 2 7.77697C2.94364 10.3311 5.27273 12.1406 8 12.1406C10.7273 12.1406 13.0564 10.3311 14 7.77697C13.0564 5.22278 10.7273 3.41333 8 3.41333ZM8 10.6861C6.49455 10.6861 5.27273 9.38278 5.27273 7.77697C5.27273 6.17115 6.49455 4.86788 8 4.86788C9.50545 4.86788 10.7273 6.17115 10.7273 7.77697C10.7273 9.38278 9.50545 10.6861 8 10.6861ZM8 6.03151C7.09455 6.03151 6.36364 6.81115 6.36364 7.77697C6.36364 8.74278 7.09455 9.52242 8 9.52242C8.90545 9.52242 9.63636 8.74278 9.63636 7.77697C9.63636 6.81115 8.90545 6.03151 8 6.03151Z" fill="white" />
                </svg>
            }
          </div>
          :
          <></>
      }

      <svg className="rounded-full group-hover:bg-secondary-space-blue" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.56768 5.15771C5.34656 4.94833 4.98937 4.94833 4.76825 5.15771L2.16584 7.62186C1.94472 7.83123 1.94472 8.16945 2.16584 8.37882L4.76825 10.843C4.98937 11.0523 5.34656 11.0523 5.56768 10.843C5.7888 10.6336 5.7888 10.2954 5.56768 10.086L3.36782 7.99765L5.56768 5.91467C5.78313 5.7053 5.78313 5.36171 5.56768 5.15771ZM10.4323 5.15771C10.2112 5.36708 10.2112 5.7053 10.4323 5.91467L12.6322 7.99765L10.4323 10.0806C10.2112 10.29 10.2112 10.6282 10.4323 10.8376C10.6534 11.047 11.0106 11.047 11.2318 10.8376L13.8342 8.37345C14.0553 8.16408 14.0553 7.82586 13.8342 7.61649L11.2318 5.15234C11.0163 4.94833 10.6534 4.94833 10.4323 5.15771ZM5.7321 8.53451C6.04394 8.53451 6.29908 8.29292 6.29908 7.99765C6.29908 7.70239 6.04394 7.4608 5.7321 7.4608C5.42027 7.4608 5.16513 7.70239 5.16513 7.99765C5.16513 8.29292 5.42027 8.53451 5.7321 8.53451ZM8 8.53451C8.31183 8.53451 8.56697 8.29292 8.56697 7.99765C8.56697 7.70239 8.31183 7.4608 8 7.4608C7.68816 7.4608 7.43303 7.70239 7.43303 7.99765C7.43303 8.29292 7.68816 8.53451 8 8.53451ZM10.2679 7.4608C9.95606 7.4608 9.70092 7.70239 9.70092 7.99765C9.70092 8.29292 9.95606 8.53451 10.2679 8.53451C10.5797 8.53451 10.8349 8.29292 10.8349 7.99765C10.8349 7.70239 10.5797 7.4608 10.2679 7.4608Z" fill="#CECECE" />
      </svg>


      <input
        type="number"
        name="min"
        placeholder="MIN"
        id="min"
        onChange={(e) => {
          setMin(e.target.value);
        }}
        value={min}
        // autoComplete="number"
        className="block w-16 h-4 rounded-xl font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white hover:placeholder-white focus:border-primary-yellow"
      />


      <p className="text-light-gray font-roboto text-[10px] font-normal leading-[12px] text-center">-</p>


      <input
        onChange={(e) => {
          setMax(e.target.value);
        }}
        value={max}
        type="number"
        name="max"
        id="max"
        placeholder="MAX"
        // autoComplete="number"
        className="block w-16 h-4 rounded-xl font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white hover:placeholder-white focus:border-primary-yellow"
      />

      {
        ishover ?
          <svg className=" h-5 w-5 rounded-full border-2 border-transparent hover:border-white bg-secondary-space-blue" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.16667 12.6667C4.16667 13.4 4.76667 14 5.5 14H10.8333C11.5667 14 12.1667 13.4 12.1667 12.6667V6C12.1667 5.26667 11.5667 4.66667 10.8333 4.66667H5.5C4.76667 4.66667 4.16667 5.26667 4.16667 6V12.6667ZM6.16667 6H10.1667C10.5333 6 10.8333 6.3 10.8333 6.66667V12C10.8333 12.3667 10.5333 12.6667 10.1667 12.6667H6.16667C5.8 12.6667 5.5 12.3667 5.5 12V6.66667C5.5 6.3 5.8 6 6.16667 6ZM10.5 2.66667L10.0267 2.19333C9.90667 2.07333 9.73333 2 9.56 2H6.77333C6.6 2 6.42667 2.07333 6.30667 2.19333L5.83333 2.66667H4.16667C3.8 2.66667 3.5 2.96667 3.5 3.33333C3.5 3.7 3.8 4 4.16667 4H12.1667C12.5333 4 12.8333 3.7 12.8333 3.33333C12.8333 2.96667 12.5333 2.66667 12.1667 2.66667H10.5Z" fill="#CECECE" />
          </svg>
          :
          <></>
      }


    </div>
  );
};
