import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { activeStateAtom } from 'state/states';

export const CommentInput = ({ setComments }) => {
  const [commentContent, setCommentContent] = useState('');
  const activeState = useRecoilValue(activeStateAtom);

  // update comment state
  const handleComment = (e) => {
    setCommentContent(e.target.value);
  };

  const handeSaveComment = () => {
    
  }

  return (
    <div className="relative flex items-center justify-around">
      <input
        onKeyPress={(ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            // handleSaveComment();
          }
        }}
        type="text"
        name=""
        value={commentContent}
        onChange={handleComment}
        placeholder="Type comments..."
        className="bg-primary-dark-blue border border-gray rounded shadow-sm h-8 w-full"
        id=""
      />
    </div>
  );
};