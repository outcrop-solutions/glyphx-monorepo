import { filtersAppliedAtom } from "@/state/filters";
import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";

export const SearchFilter = ({ lastDroppedItem }) => {
  const setFiltersApplied = useSetRecoilState(filtersAppliedAtom);
  // TODO: use FilterApplied to persist search filters applied?
  const [keyword, setKeyword] = useState("");
  const [chips, setChips] = useState([]);

  useEffect(() => {
    setFiltersApplied((prev) => {
      return [...prev, { name: lastDroppedItem, keywords: chips }];
    });
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
  return (
    <div
      onKeyPress={(ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          handleChip();
        }
      }}
      className="mt-1 focus-within:border-indigo-600"
    >
      <div className="flex overflow-x-auto scrollbar-none">
        {chips.map((item, idx) => (
          <span className="px-2 py-1 rounded-full text-gray border border-slate-300 font-semibold text-xs flex align-center cursor-pointer active:bg-slate-300 transition duration-300 ease">
            {item}
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
      <input
        type="text"
        name="keyword"
        id="name"
        autoComplete="none"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="block w-full text-white border-0 border-b border-transparent bg-transparent focus:border-indigo-600 focus:ring-0 sm:text-sm"
        placeholder="Search Keywords"
      />
    </div>
  );
};
