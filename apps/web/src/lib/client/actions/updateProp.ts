import produce from 'immer';

export const updateDrop = (axis, column) => {
  return produce((draft) => {
    // TODO: only update when z is a number
    // @ts-ignore
    draft.state.properties[`${axis}`].key = column.key;
    // @ts-ignore
    draft.state.properties[`${axis}`].dataType = column.dataType;
  });
};
