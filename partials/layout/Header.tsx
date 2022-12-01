import React from "react";
import { SearchModal, GridToggle, DropdownNotifications } from "partials";

import { useSetRecoilState } from "recoil";
import {
  showAddProjectAtom,
} from "state";
export const Header = ({ index }) => {

  const setShowAddProject = useSetRecoilState(showAddProjectAtom);

  /**
   * Returns title based on page selected
   * @returns {string}
   */
  function getTitle(): string {
    switch (index) {
      case 0:
        return "Recent"

      case 1:
        return "Drafts"

      case 2:
        return "Shared"

      case 3:
        return "Trash"

      default:
        return ""

    }
  }

  return (

    <div className="sticky flex justify-between items-center bg-secondary-midnight  h-14 w-full pt-2 pb-2 px-4 z-60">
      <div className="flex items-center group border border-transparent pr-2 ml-6 bg-transparent">
        <div className="w-72 text-left flex flex-row items-center space-x-1">
          <p className="font-rubik font-normal text-[22px] leading-[26px] tracking-[0.01em] text-white">team_name</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.29006 15.88L13.1701 12L9.29006 8.11998C8.90006 7.72998 8.90006 7.09998 9.29006 6.70998C9.68006 6.31998 10.3101 6.31998 10.7001 6.70998L15.2901 11.3C15.6801 11.69 15.6801 12.32 15.2901 12.71L10.7001 17.3C10.3101 17.69 9.68006 17.69 9.29006 17.3C8.91006 16.91 8.90006 16.27 9.29006 15.88Z" fill="#CECECE" />
          </svg>
          <p className="font-rubik font-normal text-white text-[22px] leading-[26px] tracking-[0.01em]">{getTitle()}</p>
        </div>

      </div>
      {/* TODO: FIX SEARCH MODAL ISSUE AND UNCOMMENT IT */}
      <SearchModal />
      <div className="flex flex-row space-x-3 pr-2">
        <button
          className="h-8 px-2 flex items-center justify-center bg-primary-yellow hover:bg-primary-yellow-hover rounded-[2px] ml-3"
          onClick={(e) => {
            setShowAddProject(true);
          }}
          aria-controls="search-modal"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className=" h-4 w-4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.1429 6.85714H6.85714V11.1429C6.85714 11.6143 6.47143 12 6 12C5.52857 12 5.14286 11.6143 5.14286 11.1429V6.85714H0.857143C0.385714 6.85714 0 6.47143 0 6C0 5.52857 0.385714 5.14286 0.857143 5.14286H5.14286V0.857143C5.14286 0.385714 5.52857 0 6 0C6.47143 0 6.85714 0.385714 6.85714 0.857143V5.14286H11.1429C11.6143 5.14286 12 5.52857 12 6C12 6.47143 11.6143 6.85714 11.1429 6.85714Z"
              fill="#000"
            />
          </svg>

          <p className="font-roboto font-medium text-[14px] leading-[16px] text-secondary-space-blue mx-2">New Model</p>
        </button>

        <GridToggle />
        <DropdownNotifications align="right" />
        <button
          className={`h-8 p-1 flex items-center justify-center bg-secondary-space-blue border border-transparent hover:border-white transition duration-150 rounded`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1126 12.784C18.1455 12.528 18.1701 12.272 18.1701 12C18.1701 11.728 18.1455 11.472 18.1126 11.216L19.8479 9.896C20.0042 9.776 20.0453 9.56 19.9466 9.384L18.3017 6.616C18.2277 6.488 18.0879 6.416 17.9399 6.416C17.8905 6.416 17.8412 6.424 17.8 6.44L15.7522 7.24C15.3245 6.92 14.8639 6.656 14.3622 6.456L14.0497 4.336C14.025 4.144 13.8523 4 13.6467 4H10.3569C10.1513 4 9.97861 4.144 9.95393 4.336L9.64141 6.456C9.13972 6.656 8.67915 6.928 8.25148 7.24L6.2036 6.44C6.15425 6.424 6.1049 6.416 6.05556 6.416C5.91574 6.416 5.77593 6.488 5.70191 6.616L4.05702 9.384C3.9501 9.56 3.99945 9.776 4.15571 9.896L5.89107 11.216C5.85817 11.472 5.8335 11.736 5.8335 12C5.8335 12.264 5.85817 12.528 5.89107 12.784L4.15571 14.104C3.99945 14.224 3.95833 14.44 4.05702 14.616L5.70191 17.384C5.77593 17.512 5.91574 17.584 6.06378 17.584C6.11313 17.584 6.16247 17.576 6.2036 17.56L8.25148 16.76C8.67915 17.08 9.13972 17.344 9.64141 17.544L9.95393 19.664C9.97861 19.856 10.1513 20 10.3569 20H13.6467C13.8523 20 14.025 19.856 14.0497 19.664L14.3622 17.544C14.8639 17.344 15.3245 17.072 15.7522 16.76L17.8 17.56C17.8494 17.576 17.8987 17.584 17.9481 17.584C18.0879 17.584 18.2277 17.512 18.3017 17.384L19.9466 14.616C20.0453 14.44 20.0042 14.224 19.8479 14.104L18.1126 12.784ZM16.4841 11.416C16.517 11.664 16.5253 11.832 16.5253 12C16.5253 12.168 16.5088 12.344 16.4841 12.584L16.369 13.488L17.101 14.048L17.9892 14.72L17.4135 15.688L16.369 15.28L15.5136 14.944L14.7734 15.488C14.4198 15.744 14.0826 15.936 13.7454 16.072L12.8736 16.416L12.742 17.32L12.5775 18.4H11.4261L11.2698 17.32L11.1383 16.416L10.2665 16.072C9.91281 15.928 9.58383 15.744 9.25486 15.504L8.50644 14.944L7.63465 15.288L6.59014 15.696L6.01443 14.728L6.90267 14.056L7.63465 13.496L7.5195 12.592C7.49483 12.344 7.47838 12.16 7.47838 12C7.47838 11.84 7.49483 11.656 7.5195 11.416L7.63465 10.512L6.90267 9.952L6.01443 9.28L6.59014 8.312L7.63465 8.72L8.48999 9.056L9.23018 8.512C9.58384 8.256 9.92104 8.064 10.2582 7.928L11.13 7.584L11.2616 6.68L11.4261 5.6H12.5693L12.7256 6.68L12.8572 7.584L13.7289 7.928C14.0826 8.072 14.4116 8.256 14.7406 8.496L15.489 9.056L16.3608 8.712L17.4053 8.304L17.981 9.272L17.101 9.952L16.369 10.512L16.4841 11.416ZM12.0018 8.8C10.1842 8.8 8.71205 10.232 8.71205 12C8.71205 13.768 10.1842 15.2 12.0018 15.2C13.8194 15.2 15.2916 13.768 15.2916 12C15.2916 10.232 13.8194 8.8 12.0018 8.8ZM12.0018 13.6C11.0971 13.6 10.3569 12.88 10.3569 12C10.3569 11.12 11.0971 10.4 12.0018 10.4C12.9065 10.4 13.6467 11.12 13.6467 12C13.6467 12.88 12.9065 13.6 12.0018 13.6Z" fill="white" />
          </svg>

        </button>
      </div>

    </div>
  );
};
