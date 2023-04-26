import produce from 'immer';

export const updateDrop = (axis, column) => {
  return produce((draft) => {
    // @ts-ignore
    draft.state.properties[`${axis}`].key = column.key;
    // @ts-ignore
    draft.state.properties[`${axis}`].dataType = column.dataType;
  });
};
