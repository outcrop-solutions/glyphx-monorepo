import { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listComments } from "../graphql/queries";

export const useComments = (state) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // fetch comments
    const fetchComments = async (state) => {
      if (typeof state !== "undefined") {
        try {
          const commentsData = await API.graphql(
            graphqlOperation(listComments)
          );
          const commentList = commentsData.data.listComments.items;

          setComments((prev) => {
            let newData = [
              ...commentList.filter((el) => el.stateID === state.id),
            ];
            return newData;
          });
        } catch (error) {
          console.log("error on fetching comments", error);
        }
      }
    };
    if (state) {
      fetchComments(state);
    }
  }, [state]);

  return {
    comments,
    setComments: (arg) => {
      console.log({ arg });
      setComments((prev) => {
        console.log({ hookset: [...prev, arg] });
        return [...prev, arg];
      });
    },
  };
};
