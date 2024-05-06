import {EmailTypes} from './emailTypes';

/**
 * Comes from nextAuth params
 */
export interface iAnnotationCreatedData {
  type: EmailTypes.ANNOTATION_CREATED;
  emails: string[];
  projectId: string;
  annotation: string;
  stateName: string;
  stateImage: string;
}
