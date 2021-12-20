import { API, graphqlOperation } from "aws-amplify";
import { createState } from "../../../../graphql/mutations";
import { v4 as uuid } from "uuid";
import { useStates } from "../../../../services/useStates";
export const Header = ({
  handleClick,
  setSidebarExpanded,
  sidebarExpanded,
  open,
  project,
  setStates,
}) => {
  const addState = async () => {
    // if (window && window.core) {
    const createStateInput = {
      id: uuid(),
      title: "state_name",
      description: "",
      // camera: window.core.GetCameraPosition(),
      camera: "camera-pos",
      projectID: project.id,
    };

    try {
      console.log({ createStateInput });
      const result = await API.graphql(
        graphqlOperation(createState, { input: createStateInput })
      );
      console.log({ newState: result });
      setStates(result.data.createState);
      handleClick();
    } catch (error) {
      console.log({ error });
    }
    // }
  };
  return (
    <a
      href="#0"
      className={
        "block text-gray-200 hover:text-white truncate border-b border-gray-400 transition duration-150"
      }
      onClick={(e) => {
        e.preventDefault();
        sidebarExpanded ? handleClick() : setSidebarExpanded(true);
      }}
    >
      <div
        className={`flex items-center h-11 ${
          !sidebarExpanded ? "justify-center w-full" : ""
        }`}
      >
        {/* Icon */}
        {!sidebarExpanded ? (
          <div className="flex items-center justify-center h-6 w-6">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5054 10.2221V5.77806C13.5069 5.50644 13.4362 5.23931 13.3006 5.00398C13.1649 4.76866 12.9692 4.57359 12.7334 4.43872L8.8601 2.20939C8.62503 2.07241 8.35783 2.00024 8.08577 2.00024C7.8137 2.00024 7.5465 2.07241 7.31143 2.20939L3.44076 4.43339C3.20525 4.57007 3.00979 4.76622 2.87395 5.00222C2.73811 5.23821 2.66666 5.50576 2.66677 5.77806V10.2221C2.66549 10.4939 2.73649 10.7611 2.87249 10.9965C3.0085 11.2318 3.20462 11.4268 3.44076 11.5614L7.31143 13.7914C7.5465 13.9284 7.8137 14.0005 8.08577 14.0005C8.35783 14.0005 8.62503 13.9284 8.8601 13.7914L12.7334 11.5614C12.9692 11.4265 13.1649 11.2315 13.3006 10.9961C13.4362 10.7608 13.5069 10.4937 13.5054 10.2221ZM7.3121 12.0027L4.21543 10.2221V6.63739L7.3121 8.44139V12.0027ZM8.0861 7.10006L5.0201 5.31339L8.08677 3.54806L11.1534 5.31339L8.0861 7.10006ZM11.9568 10.2201L8.8601 12.0027V8.44139L11.9568 6.63739V10.2201Z"
                fill="#fff"
              />
            </svg>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <div className="flex flex-shrink-0 ml-2">
                <svg
                  className={`w-3 h-3 flex-shrink-0 ml-1 fill-current transform text-gray-400 ${
                    open ? "rotate-0" : "-rotate-90"
                  }`}
                  viewBox="0 0 12 12"
                >
                  <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                </svg>
              </div>
              <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                States
              </span>
            </div>
            <div className="pr-4">
              <svg
                onClick={addState}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.1429 8.85714H8.85714V13.1429C8.85714 13.6143 8.47143 14 8 14C7.52857 14 7.14286 13.6143 7.14286 13.1429V8.85714H2.85714C2.38571 8.85714 2 8.47143 2 8C2 7.52857 2.38571 7.14286 2.85714 7.14286H7.14286V2.85714C7.14286 2.38571 7.52857 2 8 2C8.47143 2 8.85714 2.38571 8.85714 2.85714V7.14286H13.1429C13.6143 7.14286 14 7.52857 14 8C14 8.47143 13.6143 8.85714 13.1429 8.85714Z"
                  fill="#595E68"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </a>
  );
};
