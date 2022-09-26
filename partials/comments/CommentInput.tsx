import { useState } from "react";
import { v4 as uuid } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createComment } from "graphql/mutations";
import {userAtom } from "@/state/user";
import { useRecoilValue } from "recoil";
import { activeStateAtom } from "@/state/states";

export const CommentInput = ({ setComments }) => {
  const [commentContent, setCommentContent] = useState("");
  const user = useRecoilValue(userAtom);
  const activeState = useRecoilValue(activeStateAtom);

  // update comment state
  const handleComment = (e) => {
    setCommentContent(e.target.value);
  };

  // save comment to DynamoDB
  const handleSaveComment = async () => {
    if (typeof activeState !== "undefined") {
      let commentInput = {
        id: uuid(),
        author: user ? user.attributes.email : "",
        content: commentContent,
        stateID: activeState,
      };
      try {
        setComments(commentInput);
        setCommentContent("");
        await API.graphql(
          graphqlOperation(createComment, { input: commentInput })
        );
      } catch (error) {
        console.log({ error });
      }
    }
  };
  return (
    <div className="relative flex items-center justify-around">
      <input
        onKeyPress={(ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            handleSaveComment();
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
