'use client';
import React from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import toast from 'react-hot-toast';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {webTypes} from 'types';
import {LinkDropDown} from './LinkDropDown';
import {MemberList} from './MemberList';
import Link from 'next/link';
import {drawerOpenAtom, projectAtom, rightSidebarControlAtom} from 'state';

import CloseProjectInfoIcon from 'public/svg/close-project-info.svg';
import CopyToClipboardIcon from 'public/svg/copy-to-clipboard.svg';
import ShareIcon from 'public/svg/share-header-icon.svg';
import GroupIcon from 'public/svg/group-icon.svg';
import {WritableDraft} from 'immer/dist/internal';
import {Route} from 'next';
import {useParams} from 'next/navigation';
import useIsTeamOwner from 'lib/client/hooks/useIsOwner';

export const Share = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);
  const params = useParams();
  const project = useRecoilValue(projectAtom);
  const {data: ownership, isLoading: isOwnershipLoading} = useIsTeamOwner();
  const workspaceId = params?.workspaceId ?? project.workspace.id;
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const handleClose = () => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED;
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
            Everyone within this workspace can access this project
          </p>
        </div>
        <div className="flex flex-row justify-between mb-3">
          <div>
            <LinkDropDown />
          </div>
          <div>{/* <PermissionsDropDown /> */}</div>
        </div>
        <hr className="text-gray" />
        <div className="">
          <MemberList size="large" members={sidebarControl?.data?.members || null} />
        </div>
      </div>
      <div className="absolute bottom-0 mt-5 pl-3 pr-3 w-[250px]">
        <hr className="text-gray mb-2" />
        <div className="flex flex-row justify-between items-center space-x-3 mb-3 mt-1">
          <div className="rounded-xl border border-transparent py-1 px-2 hover:bg-secondary-midnight hover:border-white hover:cursor-pointer">
            <p className="text-light-gray font-roboto font-medium leading-[16px] text-center text-[14px]">
              {!isOwnershipLoading && (
                <CopyToClipboard onCopy={copyToClipboard} text={ownership?.inviteLink}>
                  <span className="flex items-center">
                    <CopyToClipboardIcon />
                    <span className="inline-block ml-2">Copy Link</span>
                  </span>
                </CopyToClipboard>
              )}
            </p>
          </div>
          <div
            onClick={() => {
              if (window?.core) {
                window?.core?.ToggleDrawer(false);
              }
            }}
          >
            <Link href={`/${workspaceId}/settings/team` as Route}>
              <button className="text-secondary-space-blue font-roboto font-medium text-[14px] leading-[16px] rounded-xl border bg-primary-yellow hover:bg-primary-yellow-hover py-1 px-2">
                Send Invite
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
