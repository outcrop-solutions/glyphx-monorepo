// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanComment = (comment: databaseTypes.IComment) => {
  const cleanComment = {...comment};
  delete cleanComment.createdAt;
  delete cleanComment.updatedAt;
  delete cleanComment.deletedAt;
  delete cleanComment._id;
  return cleanComment;
};

/**
 * Creates Comment
 * @returns
 */
export const _createComment = (
  comment: databaseTypes.IComment
): webTypes.IFetchConfig => {
  return {
    url: '/api/comment/create',
    options: {
      body: comment,
      method: 'POST',
    },
    successMsg: 'New comment successfully created',
  };
};

/**
 * Updates a Comment
 * @param id
 * @param name
 * @returns
 */
export const _updateComment = (
  id: string,
  dirtyComment: databaseTypes.IComment
): webTypes.IFetchConfig => {
  const comment = cleanComment(dirtyComment);
  return {
    url: `/api/comment/${id}`,
    options: {
      body: {comment},
      method: 'PUT',
    },
    successMsg: 'Comment updated successfully',
  };
};

/**
 * Deletes a comment
 * @param id
 * @returns
 */
export const _deleteComment = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/comment/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Comment successfully deleted.',
  };
};
