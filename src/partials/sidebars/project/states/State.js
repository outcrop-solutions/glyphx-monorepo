import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { useState } from "react";
import * as mutations from "../../../../graphql/mutations";
import { API } from "aws-amplify";

export const State = ({
  item,
  state,
  setState,
  deleteState,
  states,
  setStates,
}) => {
  const [title, setTitle] = useState(item.title);
  const [edit, setEdit] = useState(false);
  const handleRename = (e) => {
    setTitle(e.target.value);
  };

  const handleDelete = async () => {
    // TODO: update State list local state
    const stateDelete = {
      id: item.id,
    };

    deleteState(item);

    const deletedState = await API.graphql({
      query: mutations.deleteState,
      variables: { input: stateDelete },
    });
  };

  const handleSave = () => {
    setEdit(false);
  };

  return (
    <li
      key={item.id}
      onClick={() => {
        setState(item);
      }}
      className="py-2 group pl-2 hover:bg-gray-700 last:mb-0 flex items-center cursor-pointer"
    >
      <div className="flex items-center justify-center h-6 w-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M13.5054 10.2221V5.77806C13.5069 5.50644 13.4362 5.23931 13.3006 5.00398C13.1649 4.76866 12.9692 4.57359 12.7334 4.43872L8.8601 2.20939C8.62503 2.07241 8.35783 2.00024 8.08577 2.00024C7.8137 2.00024 7.5465 2.07241 7.31143 2.20939L3.44076 4.43339C3.20525 4.57007 3.00979 4.76622 2.87395 5.00222C2.73811 5.23821 2.66666 5.50576 2.66677 5.77806V10.2221C2.66549 10.4939 2.73649 10.7611 2.87249 10.9965C3.0085 11.2318 3.20462 11.4268 3.44076 11.5614L7.31143 13.7914C7.5465 13.9284 7.8137 14.0005 8.08577 14.0005C8.35783 14.0005 8.62503 13.9284 8.8601 13.7914L12.7334 11.5614C12.9692 11.4265 13.1649 11.2315 13.3006 10.9961C13.4362 10.7608 13.5069 10.4937 13.5054 10.2221ZM7.3121 12.0027L4.21543 10.2221V6.63739L7.3121 8.44139V12.0027ZM8.0861 7.10006L5.0201 5.31339L8.08677 3.54806L11.1534 5.31339L8.0861 7.10006ZM11.9568 10.2201L8.8601 12.0027V8.44139L11.9568 6.63739V10.2201Z"
            fill="#595E68"
          />
        </svg>
      </div>
      {edit ? (
        <div>
          <input
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                handleSave();
              }
            }}
            type="text"
            name=""
            className="bg-primary-dark-blue border border-gray-400 rounded shadow-sm h-8 w-full"
            id={item.id}
            value={title}
            onChange={handleRename}
          />
        </div>
      ) : (
        <div className="block text-gray-400 group-hover:text-gray-200 transition duration-150 truncate">
          <span
            className={`text-sm ${
              item && item.id && state && state.id
                ? item.id === state.id
                  ? "text-white"
                  : ""
                : ""
            } font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200`}
          >
            {item.title}
          </span>
        </div>
      )}
      <div className="hidden ml-2 group-hover:flex justify-between text-white w-10">
        {!edit ? (
          <PencilIcon
            onClick={() => {
              setEdit((prev) => !prev);
            }}
            className="h-4 w-4"
          />
        ) : (
          <CheckCircleIcon onClick={handleSave} className="h-4 w-4" />
        )}
        <TrashIcon onClick={handleDelete} className="h-4 w-4" />
      </div>
    </li>
  );
};
