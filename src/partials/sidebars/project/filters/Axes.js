import { AxesIcons } from "./AxesIcons";
import { useState } from "react";
import { Filter } from "./Filter";
import { RangeFilter } from "./actions/RangeFilter";
import { SearchFilter } from "./actions/SearchFilter";
import { API, graphqlOperation } from "aws-amplify";
import { deleteFilter } from "../../../../graphql/mutations";
import ShowHide from "./actions/ShowHide";
import DeleteFilter from "./actions/DeleteFilter";

export const Axes = ({
  filtersApplied,
  setFiltersApplied,
  axis,
  lastDroppedItem,
}) => {
  const [isFilter, setIsFilter] = useState(false);
  const [applied, setApplied] = useState(
    filtersApplied.includes(lastDroppedItem) ? true : false
  );
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

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
  const handleDeleteFilter = async () => {
    let deleteFilterInput = { id: lastDroppedItem.id };
    // console.log({ deleteFilterInput })
    const result = await API.graphql(
      graphqlOperation(deleteFilter, { input: deleteFilterInput })
    );
  };

  return (
    <>
      <li
        className={`py-2 group hover:bg-gray-700 hover:bg-opacity-70 pl-2 last:mb-0 flex items-center ${
          isFilter ? "border-b border-gray-500" : ""
        }`}
      >
        {/* axis icon */}
        <AxesIcons
          className="text-gray-400 group-hover:text-white"
          property={axis}
        />
        {/* filter icons */}
        {lastDroppedItem ? (
          <Filter
            isFilter={isFilter}
            setIsFilter={setIsFilter}
            type={lastDroppedItem.dataType}
          />
        ) : (
          <div className="ml-2 flex bg-split-gray-yellow items-center px-2 py-1 border border-gray-400 rounded-2xl">
            <svg
              className="mr-3 fill-current text-gray-500 group-hover:text-white"
              width="12"
              height="6"
              viewBox="0 0 12 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.56768 0.157707C3.34656 -0.0516654 2.98937 -0.0516654 2.76825 0.157707L0.16584 2.62186C-0.0552799 2.83123 -0.0552799 3.16945 0.16584 3.37882L2.76825 5.84297C2.98937 6.05234 3.34656 6.05234 3.56768 5.84297C3.7888 5.6336 3.7888 5.29538 3.56768 5.08601L1.36782 2.99765L3.56768 0.914668C3.78313 0.705296 3.78313 0.361711 3.56768 0.157707ZM8.43232 0.157707C8.2112 0.367079 8.2112 0.705296 8.43232 0.914668L10.6322 2.99765L8.43232 5.08064C8.2112 5.29001 8.2112 5.62823 8.43232 5.8376C8.65344 6.04698 9.01063 6.04698 9.23175 5.8376L11.8342 3.37345C12.0553 3.16408 12.0553 2.82586 11.8342 2.61649L9.23175 0.152338C9.0163 -0.0516655 8.65344 -0.0516654 8.43232 0.157707ZM3.7321 3.53451C4.04394 3.53451 4.29908 3.29292 4.29908 2.99765C4.29908 2.70239 4.04394 2.4608 3.7321 2.4608C3.42027 2.4608 3.16513 2.70239 3.16513 2.99765C3.16513 3.29292 3.42027 3.53451 3.7321 3.53451ZM6 3.53451C6.31183 3.53451 6.56697 3.29292 6.56697 2.99765C6.56697 2.70239 6.31183 2.4608 6 2.4608C5.68816 2.4608 5.43303 2.70239 5.43303 2.99765C5.43303 3.29292 5.68816 3.53451 6 3.53451ZM8.26789 2.4608C7.95606 2.4608 7.70092 2.70239 7.70092 2.99765C7.70092 3.29292 7.95606 3.53451 8.26789 3.53451C8.57973 3.53451 8.83487 3.29292 8.83487 2.99765C8.83487 2.70239 8.57973 2.4608 8.26789 2.4608Z" />
            </svg>

            <svg
              className="fill-current text-gray-500 group-hover:text-white"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7.14706 6.28934H6.69538L6.53528 6.13496C7.09561 5.48316 7.43294 4.63697 7.43294 3.71644C7.43294 1.66384 5.76913 3.05176e-05 3.71653 3.05176e-05C1.66393 3.05176e-05 0.00012207 1.66384 0.00012207 3.71644C0.00012207 5.76904 1.66393 7.43285 3.71653 7.43285C4.63706 7.43285 5.48325 7.09551 6.13506 6.53519L6.28943 6.69528V7.14697L9.14821 10L10.0001 9.14812L7.14706 6.28934ZM3.71653 6.28934C2.29286 6.28934 1.14363 5.14011 1.14363 3.71644C1.14363 2.29277 2.29286 1.14354 3.71653 1.14354C5.1402 1.14354 6.28943 2.29277 6.28943 3.71644C6.28943 5.14011 5.1402 6.28934 3.71653 6.28934Z" />
            </svg>
          </div>
        )}
        {/* column header chip */}
        <div
          formattype={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex justify-center bg-gray-800 h-4 ml-4 group-hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
        {/* onHover filter actions */}
        <div className="hidden group-hover:flex justify-between">
          <ShowHide applied={applied} handleApply={handleApply} />
          <DeleteFilter handleDeleteFilter={handleDeleteFilter} />
        </div>
      </li>
      {/* filtering dropdown */}
      {isFilter && lastDroppedItem ? (
        lastDroppedItem.dataType === "number" ? (
          <RangeFilter
            filtersApplied={filtersApplied}
            setFiltersApplied={setFiltersApplied}
            min={min}
            setMin={setMin}
            max={max}
            setMax={setMax}
          />
        ) : (
          <SearchFilter
            filtersApplied={filtersApplied}
            setFiltersApplied={setFiltersApplied}
            lastDroppedItem={lastDroppedItem}
          />
        )
      ) : null}
    </>
  );
};
