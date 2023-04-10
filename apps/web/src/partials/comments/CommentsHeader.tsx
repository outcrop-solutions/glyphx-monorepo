import React from 'react';
import CommentsHeaderIcon from 'public/svg/comments-header-icon.svg';

export const CommentsHeader = ({ sidebarExpanded }) => {
  return (
    <div className="flex items-center justify-between h-11 text-white border-b border-gray">
      <div className="flex items-center justify-center mx-auto">
        {/* Icon */}
        {sidebarExpanded ? (
          <>
            <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">Comments</span>
          </>
        ) : (
          <div className="flex shrink-0 mx-auto">
            <CommentsHeaderIcon />
          </div>
        )}
      </div>
    </div>
  );
};
