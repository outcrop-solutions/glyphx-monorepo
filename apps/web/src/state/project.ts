import { atom, selector, selectorFamily } from 'recoil';
import { databaseTypes, webTypes, fileIngestionTypes } from 'types';
// import { generateFilterQuery } from 'lib/client/helpers';

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
 *    template?: {
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
export const projectAtom = atom<any>({
  key: 'projectAtom',
  default: null,
});

// right sidebar info
export const projectDetailsAtom = atom<databaseTypes.IProject | null>({
  key: 'projectDetailsAtom',
  default: null,
});

/************************  QT  *************************/
export const footerLabelSelector = selector({
  key: 'footerLabelSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
  },
});

/************************  UI  *************************/

export const propertiesSelector = selector<Record<string, webTypes.Property>>({
  key: 'propertiesSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return project?.state?.properties;
  },
});

// used to add XYZ icons to datagrid columns
export const droppedPropertiesSelector = selector<webTypes.Property[]>({
  key: 'droppedPropertiesSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const axisArray = Object.values(webTypes.constants.AXIS);
    let retval: webTypes.Property[] = [];
    for (const axis of axisArray.slice(0, 3)) {
      const prop = project?.state?.properties[`${axis}`];
      if (prop?.key !== '') {
        retval.push(prop);
      }
    }
    return retval;
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
      const prop = project?.state.properties[`${axis}`];
      // const query = generateFilterQuery(prop);
      // retval.push(query);
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
        ...project?.state.properties[`${axis}`].filter,
      };
    },
});

// used to render property chip
export const singlePropertySelectorFamily = selectorFamily<webTypes.Property, webTypes.constants.AXIS>({
  key: 'singlePropertySelectorFamily',
  get:
    (axis) =>
    ({ get }) => {
      const project = get(projectAtom);
      return {
        ...project?.state.properties[`${axis}`],
      };
    },
});

export const rowIdsAtom = atom<string[] | false>({
  key: 'rowIdsAtom',
  default: false,
});
