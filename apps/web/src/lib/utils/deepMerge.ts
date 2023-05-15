import { web as webTypes } from '@glyphx/types';

export const deepMergeProject = (axis: webTypes.constants.AXIS, column: any, project) => {
  return {
    ...project,
    state: {
      ...project.state,
      properties: {
        ...project.state.properties,
        [axis]: {
          axis: axis,
          accepts: column.type, //added by DnD Lib
          key: column.key,
          dataType: column.dataType,
          interpolation: project.state.properties[axis].interpolation,
          direction: project.state.properties[axis].direction,
          filter: {
            ...project.state.properties[axis].filter,
          },
        },
      },
    },
  };
};
