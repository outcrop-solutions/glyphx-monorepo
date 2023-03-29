import { atom, selector, selectorFamily } from 'recoil';
import { database as databaseTypes, web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { generateFilterQuery } from 'lib/client/helpers';

/**
 * EXAMPLE PROJECT
 *
 * interface IProject {
 *    _id?: mongooseTypes.ObjectId;
 *    createdAt: Date;
 *    updatedAt: Date;
 *    name: string;
 *    description?: string;
 *    sdtPath?: string;
 *    lastOpened?: Date;
 *    currentVersion: number;
 *    slug?: string;
 *    isTemplate: Boolean;
 *    type?: {
 *          createdAt: Date;
 *          updatedAt: Date;
 *          name: string;
 *          projects: [ObjectId] // IProject[]
 *          shape: Record<string, {type: string; required: boolean}>;}
 *    workspace: {
 *         workspaceCode: string;
 *         inviteCode: string;
 *         name: string;
 *         slug: string;
 *         createdAt: Date;
 *         updatedAt: Date;
 *         deletedAt?: Date;
 *         description?: string;
 *         creator: ObjectId;   // IUser
 *         members: [ObjectId]; // IMember[]
 *         projects:[ObjectId]; // IProject[]
 *    }
 *    files: [{
 *         fileName: string;
 *         tableName: string;
 *         numberOfRows: number;
 *         numberOfColumns: number;
 *         columns: [{
 *             name: string;
 *             fieldType: FIELD_TYPE;
 *             longestString?: number | undefined;
 *         }];
 *         fileSize: number;
 *    }];
 *    owner: {
 *         userCode: string;
 *         name: string;
 *         username: string;
 *         gh_username?: string;
 *         email: string;
 *         emailVerified?: Date;
 *         isVerified: boolean;
 *         image?: string;
 *         createdAt: Date;
 *         updatedAt: Date;
 *         deletedAt?: Date;
 *         accounts: [ObjectId];          // IAccount[]
 *         sessions: ISession[];
 *         membership: [ObjectId];        // IMember[];
 *         invitedMembers: [ObjectId];    // IMember[];
 *         createdWorkspaces: [ObjectId]; // IWorkspace[];
 *         projects: [ObjectId];          // IProject[];
 *         customerPayment?: ICustomerPayment;
 *         webhooks: IWebhook[];
 *         apiKey?: string;
 *    }
 *    state: {
 *      properties: {
 *         "X": {
 *           axis: AXIS;
 *           accepts: ACCEPTS;
 *           key: string; // corresponds to column name
 *           dataType: FIELD_TYPE; // corresponds to column data type
 *           interpolation: INTERPOLATION_TYPE;
 *           direction: DIRECTION_TYPE;
 *           filter: {
 *              min: number;
 *              max: number;
 *           }
 *         },
 *         "y": {
 *           axis: AXIS;
 *           accepts: ACCEPTS;
 *           key: string; // corresponds to column name
 *           dataType: FIELD_TYPE; // corresponds to column data type
 *           interpolation: INTERPOLATION_TYPE;
 *           direction: DIRECTION_TYPE;
 *           filter: {
 *              keywords: string[];
 *           }
 *         }
 *         "z": {
 *           axis: AXIS;
 *           accepts: ACCEPTS;
 *           key: string; // corresponds to column name
 *           dataType: FIELD_TYPE; // corresponds to column data type
 *           interpolation: INTERPOLATION_TYPE;
 *           direction: DIRECTION_TYPE;
 *           filter: {
 *              keywords: string[];
 *           }
 *         }
 *      };
 *    }
 *    fileSystemHash: string;
 *    stateHistory?: [ObjectId]; // IState[];
 *    viewName?: string;
 * }
 * @condition state is transferred to state snapshot on user click if 3 props are dropped
 * @condition fileSystemHash: corresponds to MD5 hash of S3 directory structure (if hash changes, projects templates that attach to a this state  are invalidated)
 * @condition filter
 * @note stateHistory: is a list of all states that have been created for this project
 * @note payload sent to Qt will be dynamically constructed,
 */

/************************  BASE  *************************/
export const projectAtom = atom<databaseTypes.IProject | null>({
  key: 'projectAtom',
  default: null,
});

/************************  Qt  *************************/

// returns a function, which returns a selector partially applied
export const openModelPayloadSelectorFamily = selectorFamily<webTypes.IOpenModelPayload, string>({
  key: 'openModelPayloadSelector',
  get:
    (url) =>
    ({ get }) => {
      const project = get(projectAtom);
      return {
        lastOpened: project.lastOpened,
        signedUrl: url,
      };
    },
});

/************************  UI  *************************/

export const propertiesSelector = selector<webTypes.Property[]>({
  key: 'propertiesSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return project.state.properties;
  },
});

// used to add XYZ icons to datagrid columns
export const droppedPropertiesSelector = selector<webTypes.Property[]>({
  key: 'droppedPropertiesSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const axisArray = Object.values(webTypes.constants.AXIS);
    let retval = [];
    for (const axis of axisArray.slice(0, 3)) {
      const prop = project.state.properties[`${axis}`];
      if (prop.key !== '') {
        retval.push(prop);
      }
    }
    return retval;
  },
});

/************************ GLYPH ENGINE *************************/

// are there 3 properties dropped for x, y & z?
export const arePropsAlreadyDroppedSelector = selector<boolean>({
  key: 'arePropsAlreadyDroppedSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const axisArray = Object.values(webTypes.constants.AXIS);
    let retval = true;
    for (const axis of axisArray.slice(0, 3)) {
      const prop = project.state.properties[`${axis}`];
      if (prop.key === '') {
        retval = false;
      }
    }
    return retval;
  },
});

// is z-axis numeric?
export const isZAxisNumericSelector = selector<boolean>({
  key: 'isZAxisNumericSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return (
      project.state.properties[webTypes.constants.AXIS.Z].dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
    );
  },
});

// can we call ETL?
export const canCallETL = selector<boolean>({
  key: 'canCallETLSelector',
  get: ({ get }) => {
    const propsSafe = get(arePropsAlreadyDroppedSelector);
    const zAxisNumeric = get(isZAxisNumericSelector);
    return propsSafe && zAxisNumeric;
  },
});

// payload sent to createModel call
export const createModelPayloadSelector = selector<webTypes.ICreateModelPayload>({
  key: 'createModelPayloadSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const filter = get(filterQuerySelector);

    return {
      projectId: project._id,
      userId: project.owner._id,
      filter: filter,
      x_axis: project.state.properties[webTypes.constants.AXIS.X]['key'],
      y_axis: project.state.properties[webTypes.constants.AXIS.Y]['key'],
      z_axis: project.state.properties[webTypes.constants.AXIS.Z]['key'],
      x_func: project.state.properties[webTypes.constants.AXIS.X]['interpolation'],
      y_func: project.state.properties[webTypes.constants.AXIS.Y]['interpolation'],
      z_func: project.state.properties[webTypes.constants.AXIS.Z]['interpolation'],
      x_direction: project.state.properties[webTypes.constants.AXIS.X]['direction'],
      y_direction: project.state.properties[webTypes.constants.AXIS.Y]['direction'],
      z_direction: project.state.properties[webTypes.constants.AXIS.Z]['direction'],
    };
  },
});

/************************ FILTERS *************************/

// creates unified filter query for createModel call
export const filterQuerySelector = selector<string>({
  key: 'filterQuerySelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const axisArray = Object.values(webTypes.constants.AXIS);
    let retval = [];
    for (const axis of axisArray) {
      const prop = project.state.properties[`${axis}`];
      const query = generateFilterQuery(prop);
      retval.push(query);
    }
    return retval.join(' AND ');
  },
});

// used to render single filter
export const singleFilterSelectorFamily = selectorFamily<webTypes.Filter, webTypes.constants.AXIS>({
  key: 'singleFilterSelectorFamily',
  get:
    (axis) =>
    ({ get }) => {
      const project = get(projectAtom);
      return {
        ...project.state.properties[`${axis}`].filter,
      };
    },
});
