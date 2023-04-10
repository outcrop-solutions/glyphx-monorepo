import React from 'react';
import { CommentsHeader } from './CommentsHeader';
import { CommentInput } from './CommentInput';
import { History } from './CommentHistory';
import { useRecoilState } from 'recoil';

// TODO: reinstate comments functionality
export const CommentsSidebar = () => {
  return (
    <>
      <div
        id="sidebar"
        className={`hidden lg:flex flex-col absolute z-10 right-0 top-0 lg:static border-l border-gray lg:right-auto lg:top-auto lg:translate-x-0 transform h-full scrollbar-none w-64 lg:w-20 lg:comments-sidebar-expanded:!w-64 shrink-0 transition-all duration-200 ease-in-out ${
          true ? 'translate-y-64' : 'translate-x-0'
        }`}
      >
        {/* <CommentsHeader sidebarExpanded={commentsOpen} /> */}
        <div className="m-2 hidden comments-sidebar-expanded:block overflow-y-scroll scrollbar-thin scrollbar-thumb-yellow scrollbar-thumb-rounded-full">
          {/* <History comments={comments} />
            <CommentInput setComments={setComments} /> */}
        </div>
      </div>
    </>
  );
};
