import { web as webTypes } from '@glyphx/types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

export const updateDrop = (axis, column) => {
  return produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
    draft.state.properties[`${axis}`].key = column.key;
    draft.state.properties[`${axis}`].dataType = column.dataType;
  });
};
