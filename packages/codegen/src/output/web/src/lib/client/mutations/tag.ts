// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanTag = (tag: databaseTypes.ITag) => {
  const cleanTag = {...tag};
  delete cleanTag.createdAt;
  delete cleanTag.updatedAt;
  delete cleanTag.deletedAt;
  delete cleanTag._id;
  return cleanTag;
};

/**
 * Creates Tag
 * @returns
 */
export const _createTag = (tag: databaseTypes.ITag): webTypes.IFetchConfig => {
  return {
    url: '/api/tag/create',
    options: {
      body: tag,
      method: 'POST',
    },
    successMsg: 'New tag successfully created',
  };
};

/**
 * Updates a Tag
 * @param id
 * @param name
 * @returns
 */
export const _updateTag = (
  id: string,
  dirtyTag: databaseTypes.ITag
): webTypes.IFetchConfig => {
  const tag = cleanTag(dirtyTag);
  return {
    url: `/api/tag/${id}`,
    options: {
      body: {tag},
      method: 'PUT',
    },
    successMsg: 'Tag updated successfully',
  };
};

/**
 * Deletes a tag
 * @param id
 * @returns
 */
export const _deleteTag = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/tag/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Tag successfully deleted.',
  };
};
