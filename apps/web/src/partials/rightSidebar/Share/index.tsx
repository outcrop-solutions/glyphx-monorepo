import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import produce from 'immer';
import toast from 'react-hot-toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { LinkDropDown } from './LinkDropDown';
import { PermissionsDropDown } from './PermissionsDropDown';
import { MemberList } from './MemberList';

import { projectAtom, rightSidebarControlAtom } from 'state';

import CloseProjectInfoIcon from 'public/svg/close-project-info.svg';
import CopyToClipboardIcon from 'public/svg/copy-to-clipboard.svg';
import ShareIcon from 'public/svg/share-header-icon.svg';
import GroupIcon from 'public/svg/group-icon.svg';

export const Share = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);
  const [showShareText, setShareText] = useState(false);
  const selectedProject = useRecoilValue(projectAtom);

  /**
   * Copies Model Link to clipboard
   */
  function copyLinkToClipBoard() {
    navigator.clipboard.writeText('https://app.glyphx.co/share/' + selectedProject.id);
    setShareText(true);
    setTimeout(() => {
      //take away text after 3 seconds
      setShareText(false);
    }, 3000);
  }

  const handleClose = () => {
    setRightSidebarControl(
      produce((draft) => {
        draft.type = false;
      })
    );
  };

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  return (
    <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full">
      <div className="pt-5 pl-3 pr-3">
        <div className="flex flex-row justify-between mb-2">
          <p className="text-light-gray font-roboto font-medium text-[14px] leading-[16.41px]">
            <span className="inline-block mr-2">
              <ShareIcon />
            </span>
            Share
          </p>
          <div onClick={handleClose}>
            <CloseProjectInfoIcon />
          </div>
        </div>
        <div className="flex flex-row justify-between mb-2">
          <p className="text-gray font-roboto font-normal text-[10px] leading-[11.72px]">
            <span className="inline-block mr-2">
              <GroupIcon />
            </span>
            Everyone at Notre Dame Idea Center can access this file.
          </p>
        </div>
        <div className="flex flex-row justify-between mb-3">
          <div>
            <LinkDropDown align="right" />
          </div>
          <div>
            <PermissionsDropDown align="right" />
          </div>
        </div>
        <hr className="text-gray" />
        <div className="">
          {/* <PermissionsDropDown />
          <LinkDropDown/> */}
          <MemberList size="large" members={[sidebarControl?.data?.owner] || null} />
        </div>
      </div>
      <div className="absolute bottom-0 mt-5 pl-3 pr-3">
        <hr className="text-gray mb-2" />
        <div className="flex flex-row justify-between items-center space-x-3 mb-3 mt-2">
          <div
            onClick={copyLinkToClipBoard}
            className="rounded-xl border border-transparent py-1 px-2 hover:bg-secondary-midnight hover:border-white hover:cursor-pointer"
          >
            <p className="text-light-gray font-roboto font-medium leading-[16px] text-center text-[14px]">
              <span className="inline-block mr-2">
                <CopyToClipboard
                  onCopy={copyToClipboard}
                  text={`https://app.glyphx.co/share/${sidebarControl?.data?._id}`}
                >
                  <CopyToClipboardIcon />
                </CopyToClipboard>
              </span>
              Copy Link
            </p>
          </div>

          <div>
            <button className="text-secondary-space-blue font-roboto font-medium text-[14px] leading-[16px] rounded-xl border bg-primary-yellow hover:bg-primary-yellow-hover py-1 px-2">
              Send Invite
            </button>
          </div>
        </div>
        <div className="mt-0 w-full pl-3 pr-3 mb-2">
          {showShareText && <p className="text-white text-base">Link copied to clipboard</p>}
        </div>
      </div>
    </div>
  );
};
