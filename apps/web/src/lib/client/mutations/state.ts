import { database as databaseTypes, web as webTypes } from '@glyphx/types';

// STATE MUTATIONS

export const _createAnnotation = ({
  id,
  type,
  value,
}: {
  id: string;
  type: databaseTypes.constants.ANNOTATION_TYPE;
  value: string;
}) => {
  return {
    url:
      type === databaseTypes.constants.ANNOTATION_TYPE.PROJECT
        ? `/api/annotations/project/${id}`
        : `/api/annotations/state/${id}`,
    options: {
      body: {
        value,
      },
      method: 'POST',
    },
    successMsg: 'Annotation created!',
  };
};

/**
 * Creates a new state
 * @note uses stateService.createState() in business package
 * @param name corresponds to state.name in mongoDB
 */
export const _createState = (
  name: string,
  projectId: string,
  camera: webTypes.Camera,
  aspectRatio: webTypes.Aspect,
  imageHash: string
): webTypes.IFetchConfig => {
  return {
    url: '/api/state',
    options: {
      body: { name: name, projectId: projectId, camera, imageHash, aspectRatio },
      method: 'POST',
    },
    successMsg: 'State successfully created',
  };
};

/**
 * Deletes a state
 * @note uses stateService.deleteState() in business package
 * @param slug corresponds to state.slug in mongoDB
 */
export const _deleteState = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/state`,
    options: {
      method: 'DELETE',
      body: { stateId: id },
    },
    successMsg: 'State has been deleted',
  };
};

/**
 * Updates a state's name
 * @note uses stateService.updateStateName() in business package
 * @param id corresponds to state.slug in mongoDB
 * @param name corresponds to state.name in mongoDB
 */
export const _updateStateName = ({ id, name }: { id: string; name: string }): webTypes.IFetchConfig => {
  return {
    url: `/api/state`,
    options: {
      body: { name, stateId: id },
      method: 'PUT',
    },
    successMsg: 'State name successfully updated!',
  };
};
