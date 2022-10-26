import React,{ useState } from "react";
import { LinkDropDown } from "./LinkDropDown";
import { MemberList } from "./MemberList";
import { PermissionsDropDown } from "./PermissionsDropDown";

import {
  selectedProjectSelector,
  sdtValue
} from "state";
import { useRecoilValue } from "recoil";

export const ShareModule = ({ setShare }) => {

  const [showShareText, setShareText] = useState(false);
  const selectedProject= useRecoilValue(selectedProjectSelector);
  const sdtName = useRecoilValue(sdtValue)

  const handleInvite = async () => {
    try {
      const response = await fetch(`/api/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      console.log({ response });

      setShare(false);
    } catch (error) {
    } finally {
    }
  };

  /**
   * Copies Model Link to clipboard
   */
  function copyLinkToClipBoard(){
    navigator.clipboard.writeText("https://app.glyphx.co/share/"+selectedProject.id);
    setShareText(true);
    setTimeout(() => { //take away text after 3 seconds
      setShareText(false);
    }, 3000);
  }

  // <div className={sdtName === null ? 
  //   "flex flex-col absolute z-60 ml-10 w-67 bg-secondary-space-blue h-full border border-l-gray border-l-1  border-t-gray border-t-1"
  // :
  // "flex flex-col w-67 bg-secondary-space-blue h-full border border-l-gray border-l-1  border-t-gray border-t-1"
  // }>

  return (
    <div className=
    "flex flex-col w-[250px] bg-secondary-space-blue h-full border border-l-gray border-l-1  border-t-gray border-t-1"
    >
    {/* <div className="flex flex-col w-67 bg-secondary-space-blue h-full border border-l-gray border-l-1  border-t-gray border-t-1"> */}
      <div className="pt-5 pl-3 pr-3">
        <div className="flex flex-row justify-between mb-2">
          <p className="text-light-gray text-lg">
            <span className="inline-block">
              <svg
                className="mr-2"
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.1818 5.81818C11.7891 5.81818 13.0909 4.51636 13.0909 2.90909C13.0909 1.30182 11.7891 0 10.1818 0C8.57455 0 7.27273 1.30182 7.27273 2.90909C7.27273 4.51636 8.57455 5.81818 10.1818 5.81818ZM3.63636 4.36364V2.90909C3.63636 2.50909 3.30909 2.18182 2.90909 2.18182C2.50909 2.18182 2.18182 2.50909 2.18182 2.90909V4.36364H0.727273C0.327273 4.36364 0 4.69091 0 5.09091C0 5.49091 0.327273 5.81818 0.727273 5.81818H2.18182V7.27273C2.18182 7.67273 2.50909 8 2.90909 8C3.30909 8 3.63636 7.67273 3.63636 7.27273V5.81818H5.09091C5.49091 5.81818 5.81818 5.49091 5.81818 5.09091C5.81818 4.69091 5.49091 4.36364 5.09091 4.36364H3.63636ZM10.1818 7.27273C8.24 7.27273 4.36364 8.24727 4.36364 10.1818V10.9091C4.36364 11.3091 4.69091 11.6364 5.09091 11.6364H15.2727C15.6727 11.6364 16 11.3091 16 10.9091V10.1818C16 8.24727 12.1236 7.27273 10.1818 7.27273Z"
                  fill="#CECECE"
                />
              </svg>
            </span>
            Share
          </p>
          <svg
            onClick={() => {
              setShare(false);
            }}
            className="w-6 h-6 rounded-xl p-1 border border-transparent hover:border-white hover:cursor-pointer hover:text-yellow"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3 0.709971C12.91 0.319971 12.28 0.319971 11.89 0.709971L6.99997 5.58997L2.10997 0.699971C1.71997 0.309971 1.08997 0.309971 0.699971 0.699971C0.309971 1.08997 0.309971 1.71997 0.699971 2.10997L5.58997 6.99997L0.699971 11.89C0.309971 12.28 0.309971 12.91 0.699971 13.3C1.08997 13.69 1.71997 13.69 2.10997 13.3L6.99997 8.40997L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L8.40997 6.99997L13.3 2.10997C13.68 1.72997 13.68 1.08997 13.3 0.709971Z"
              fill="#CECECE"
            />
          </svg>
        </div>
        <div className="flex flex-row justify-between mb-2">
          <p className="text-xs text-light-gray">
            <span className="inline-block">
              <svg
                className="mr-2"
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.99998 5.00004C6.28665 5.00004 7.33331 3.95337 7.33331 2.66671C7.33331 1.38004 6.28665 0.333374 4.99998 0.333374C3.71331 0.333374 2.66665 1.38004 2.66665 2.66671C2.66665 3.95337 3.71331 5.00004 4.99998 5.00004ZM4.99998 1.66671C5.55331 1.66671 5.99998 2.11337 5.99998 2.66671C5.99998 3.22004 5.55331 3.66671 4.99998 3.66671C4.44665 3.66671 3.99998 3.22004 3.99998 2.66671C3.99998 2.11337 4.44665 1.66671 4.99998 1.66671ZM4.99998 6.16671C3.43998 6.16671 0.333313 6.94671 0.333313 8.50004V9.00004C0.333313 9.36671 0.633313 9.66671 0.99998 9.66671H8.99998C9.36665 9.66671 9.66665 9.36671 9.66665 9.00004V8.50004C9.66665 6.94671 6.55998 6.16671 4.99998 6.16671ZM1.89331 8.33337C2.45331 7.94671 3.80665 7.50004 4.99998 7.50004C6.19331 7.50004 7.54665 7.94671 8.10665 8.33337H1.89331ZM9.69331 6.20671C10.4666 6.76671 11 7.51337 11 8.50004V9.66671H13C13.3666 9.66671 13.6666 9.36671 13.6666 9.00004V8.50004C13.6666 7.15337 11.3333 6.38671 9.69331 6.20671ZM8.99998 5.00004C10.2866 5.00004 11.3333 3.95337 11.3333 2.66671C11.3333 1.38004 10.2866 0.333374 8.99998 0.333374C8.63998 0.333374 8.30665 0.420041 7.99998 0.566707C8.41998 1.16004 8.66665 1.88671 8.66665 2.66671C8.66665 3.44671 8.41998 4.17337 7.99998 4.76671C8.30665 4.91337 8.63998 5.00004 8.99998 5.00004Z"
                  fill="#595E68"
                />
              </svg>
            </span>
            Everyone at Notre Dame Idea Center can access this file.
          </p>
        </div>

        <div className="flex flex-row justify-between mb-3">
          <div>
            <LinkDropDown align="right" />
          </div>
          <div>
            <label></label>

            <PermissionsDropDown align="right" />
          </div>
        </div>

        <hr className="text-gray"/>

        <div className="">
          {/* <PermissionsDropDown />
          <LinkDropDown/> */}
          <MemberList />
        </div>
      </div>

      {/* <div className="absolute bottom-20 mt-5 w-full pl-3 pr-3">
        <hr className="text-gray mb-2" />
        <div className="flex flex-row justify-between mb-3 mt-2">
          <div onClick={copyLinkToClipBoard} className="rounded-2xl border border-transparent p-2 hover:border-white hover:cursor-pointer">
            <p className="text-white text-sm">
              <span className="inline-block">
                <svg
                  className="mr-2"
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.3333 0.666626H8.33331C7.96665 0.666626 7.66665 0.966626 7.66665 1.33329C7.66665 1.69996 7.96665 1.99996 8.33331 1.99996H10.3333C11.4333 1.99996 12.3333 2.89996 12.3333 3.99996C12.3333 5.09996 11.4333 5.99996 10.3333 5.99996H8.33331C7.96665 5.99996 7.66665 6.29996 7.66665 6.66663C7.66665 7.03329 7.96665 7.33329 8.33331 7.33329H10.3333C12.1733 7.33329 13.6666 5.83996 13.6666 3.99996C13.6666 2.15996 12.1733 0.666626 10.3333 0.666626ZM4.33331 3.99996C4.33331 4.36663 4.63331 4.66663 4.99998 4.66663H8.99998C9.36665 4.66663 9.66665 4.36663 9.66665 3.99996C9.66665 3.63329 9.36665 3.33329 8.99998 3.33329H4.99998C4.63331 3.33329 4.33331 3.63329 4.33331 3.99996ZM5.66665 5.99996H3.66665C2.56665 5.99996 1.66665 5.09996 1.66665 3.99996C1.66665 2.89996 2.56665 1.99996 3.66665 1.99996H5.66665C6.03331 1.99996 6.33331 1.69996 6.33331 1.33329C6.33331 0.966626 6.03331 0.666626 5.66665 0.666626H3.66665C1.82665 0.666626 0.333313 2.15996 0.333313 3.99996C0.333313 5.83996 1.82665 7.33329 3.66665 7.33329H5.66665C6.03331 7.33329 6.33331 7.03329 6.33331 6.66663C6.33331 6.29996 6.03331 5.99996 5.66665 5.99996Z"
                    fill="#CECECE"
                  />
                </svg>
              </span>
              Copy Link
            </p>
          </div>

          <div>
            <button className="text-secondary-space-blue text-sm font-medium rounded-2xl border bg-yellow border-yellow p-2">
              Send Invite
            </button>
          </div>
        </div>
        <div className="mt-0 w-full pl-3 pr-3">
        {
          showShareText && (
            <p className="text-white text-base">Link copied to clipboard</p>
          )
        }
      </div>
      </div> */}
    </div>
  );
};
