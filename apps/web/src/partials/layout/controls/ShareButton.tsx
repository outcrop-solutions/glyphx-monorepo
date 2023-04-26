import React from 'react';
import ShareIcon from 'public/svg/share-icon.svg';
import { useSetRecoilState } from 'recoil';
import { rightSidebarControlAtom } from 'state';
import produce from 'immer';

const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const ShareButton = () => {
  const setShowCreateProject = useSetRecoilState(rightSidebarControlAtom);

  const showShare = () => {
    setShowCreateProject(
      produce((draft) => {
        draft.type = 'share';
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
