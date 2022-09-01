import React from "react";
import { useState, useEffect, useRef } from "react";
import { usePosition } from "services/usePosition";
import { CommentsHeader } from "./CommentsHeader";
import { ExpandCollapse } from "../layout/ExpandCollapse";
import { CommentInput } from "./CommentInput";
import { History } from "./CommentHistory";
import { useRecoilState, useRecoilValue } from "recoil";
import { commentsOpenAtom, commentsSelector } from "state/comments";

export const CommentsSidebar = ({
  project,
  setCommentsPosition,
  user,
  state,
  states,
}) => {
  const [commentsOpen, setCommentsOpen] = useRecoilState(commentsOpenAtom);
  const [comments, setComments] = useRecoilState(commentsSelector);

  // refs for sidebar trigger and resize
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const pos = usePosition(sidebar);

  //fetch commentsSidebar position on layout resize
  useEffect(() => {
    setCommentsPosition((prev) => {
      if (sidebar.current !== null) {
        return {
          values: sidebar.current.getBoundingClientRect(),
        };
      }
    });
  }, [pos, setCommentsPosition]);

  return (
    <>
      {states && state && states.length > 0 ? (
        <div
          id="sidebar"
          ref={sidebar}
          className={`hidden lg:flex flex-col absolute z-10 right-0 top-0 lg:static border-l border-slate-400 lg:right-auto lg:top-auto lg:translate-x-0 transform h-full scrollbar-none w-64 lg:w-20 lg:comments-sidebar-expanded:!w-64 shrink-0 transition-all duration-200 ease-in-out ${
            commentsOpen ? "translate-y-64" : "translate-x-0"
          }`}
        >
          <CommentsHeader sidebarExpanded={commentsOpen} />
          <div className="m-2 hidden comments-sidebar-expanded:block overflow-y-scroll scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-thumb-rounded-full">
            <History comments={comments} />
            <CommentInput user={user} state={state} setComments={setComments} />
          </div>

          {/* Expand / collapse button */}
          {/* <div className="sticky bottom-0">
            <ExpandCollapse
              sidebarExpanded={commentsOpen}
              setSidebarExpanded={setCommentsOpen}
            />
          </div> */}
        </div>
      ) : null}
    </>
  );
};
