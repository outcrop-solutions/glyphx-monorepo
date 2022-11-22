import { filtersAppliedAtom } from "@/state/filters";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";

export const SearchFilter = ({ lastDroppedItem }) => {
  const [filtersApplied,setFiltersApplied] = useRecoilState(filtersAppliedAtom);
  // TODO: consider persisting applied filters in localStorage
  const [keyword, setKeyword] = useState("");
  const [chips, setChips] = useState([]);
  const [showVisibility, setVisibility] = useState(false); //true means eye with no dash, false means eye with dash
  const [ishover, setHover] = useState(false);

  useEffect(() => {
    // setFiltersApplied((prev) => {
    //   return [...prev, { name: lastDroppedItem, keywords: chips }];
    // });
    console.log({ chips })
  }, [chips]);

  const handleChip = () => {
    setChips((prev) => {
      setKeyword("");
      return [...prev, keyword];
    });
  };
  const handleDelete = (item) => {
    setChips((prev) => {
      let newChips = [...prev].filter((el) => el !== item);
      return newChips;
    });
  };

  function showHidden(){
    setHover(true);
  }

  function hideHidden(){
    setHover(false);
  }

  return (
    <div
      onKeyPress={(ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          handleChip();
        }
      }}
      className="mt-1"
    >
      <div className="flex flex-wrap scrollbar-none ml-2 mr-2">
        {chips.map((item, idx) => (
          <span key={idx} className="px-2 py-1 mt-1 mr-1 rounded-full bg-primary-yellow hover:bg-primary-yellow-hover text-secondary-midnight font-roboto font-normal text-[14px] flex flex-row items-baseline justify-center align-middle cursor-pointer">
            <p>{item}</p>
            <button className="bg-transparent hover focus:outline-none">
              <svg
                onClick={() => handleDelete(item)}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="times"
                className="svg-inline--fa fa-times w-2 ml-1"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 352 512"
              >
                <path
                  fill="currentColor"
                  d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                ></path>
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div 
      onMouseOver={showHidden}
      onMouseOut={hideHidden} 
      className="group flex flex-row justify-evenly items-center hover:bg-secondary-midnight py-1">
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
        
        <div className="flex flex-row space-x-2 items-center">
          <svg className="rounded-full group-hover:bg-secondary-space-blue" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3333 9.33332H9.80666L9.62 9.15332C10.42 8.21999 10.8333 6.94666 10.6067 5.59332C10.2933 3.73999 8.74666 2.25999 6.88 2.03332C4.06 1.68666 1.68666 4.05999 2.03333 6.87999C2.26 8.74666 3.74 10.2933 5.59333 10.6067C6.94666 10.8333 8.22 10.42 9.15333 9.61999L9.33333 9.80666V10.3333L12.1667 13.1667C12.44 13.44 12.8867 13.44 13.16 13.1667C13.4333 12.8933 13.4333 12.4467 13.16 12.1733L10.3333 9.33332ZM6.33333 9.33332C4.67333 9.33332 3.33333 7.99332 3.33333 6.33332C3.33333 4.67332 4.67333 3.33332 6.33333 3.33332C7.99333 3.33332 9.33333 4.67332 9.33333 6.33332C9.33333 7.99332 7.99333 9.33332 6.33333 9.33332Z" fill="#CECECE" />
          </svg>

          <input
            type="text"
            name="keyword"
            id="name"
            autoComplete="none"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="block w-[110px] h-4 rounded-xl font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white hover:placeholder-white focus:border-primary-yellow"
            placeholder="Search Keywords"
          />
        </div>
        {
          ishover ?
          <svg className=" h-5 w-5 rounded-full border-2 border-transparent hover:border-white bg-secondary-space-blue" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.16667 12.6667C4.16667 13.4 4.76667 14 5.5 14H10.8333C11.5667 14 12.1667 13.4 12.1667 12.6667V6C12.1667 5.26667 11.5667 4.66667 10.8333 4.66667H5.5C4.76667 4.66667 4.16667 5.26667 4.16667 6V12.6667ZM6.16667 6H10.1667C10.5333 6 10.8333 6.3 10.8333 6.66667V12C10.8333 12.3667 10.5333 12.6667 10.1667 12.6667H6.16667C5.8 12.6667 5.5 12.3667 5.5 12V6.66667C5.5 6.3 5.8 6 6.16667 6ZM10.5 2.66667L10.0267 2.19333C9.90667 2.07333 9.73333 2 9.56 2H6.77333C6.6 2 6.42667 2.07333 6.30667 2.19333L5.83333 2.66667H4.16667C3.8 2.66667 3.5 2.96667 3.5 3.33333C3.5 3.7 3.8 4 4.16667 4H12.1667C12.5333 4 12.8333 3.7 12.8333 3.33333C12.8333 2.96667 12.5333 2.66667 12.1667 2.66667H10.5Z" fill="#CECECE" />
        </svg>
          :
          <></>
        }
        
      </div>

    </div>

  );
};
