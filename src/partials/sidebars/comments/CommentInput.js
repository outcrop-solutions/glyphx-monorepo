import { useState } from "react";
import { v4 as uuid } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createComment } from "../../../graphql/mutations";

export const CommentInput = ({ user, state, setComments }) => {
  const [commentContent, setCommentContent] = useState("");

  // update comment state
  const handleComment = (e) => {
    setCommentContent(e.target.value);
  };
  // save comment to DynamoDB
  const handleSaveComment = async () => {
    if (typeof state !== "undefined") {
      let commentInput = {
        id: uuid(),
        author: user ? user.attributes.email : "",
        content: commentContent,
        stateID: state.id,
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
        className="bg-primary-dark-blue border border-gray-400 rounded shadow-sm h-8 w-full"
        id=""
      />
    </div>
  );
};
