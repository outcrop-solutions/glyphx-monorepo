import React from 'react';
import ShareIcon from 'public/svg/share-icon.svg';
import { useSetRecoilState } from 'recoil';
import { webTypes } from 'types';
import { rightSidebarControlAtom } from 'state';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const ShareButton = () => {
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);

  const showShare = () => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.SHARE;
      })
    );
  };

  return (
    <button className={`${btnPrimary}`} onClick={() => showShare()} aria-controls="share-control">
      <ShareIcon />
      <p className={`${btnTextPrimary}`}>Share</p>
    </button>
  );
};
