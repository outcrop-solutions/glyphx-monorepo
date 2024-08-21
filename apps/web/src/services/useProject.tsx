'use client';
import {useCallback} from 'react';
import {useSetRecoilState} from 'recoil';
import {fileIngestionTypes, webTypes, glyphEngineTypes} from 'types';
import {projectAtom} from 'state';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const useProject = () => {
  const setProject = useSetRecoilState(projectAtom);

  const handleDrop = useCallback(
    (axis: webTypes.constants.AXIS, column: any, project: webTypes.IHydratedProject, isFilter: boolean) => {
      // we can compose these for a one liner
      // callETL(axis, column, project, isFilter);
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.state.properties[`${axis}`].key = column.key;
          draft.state.properties[`${axis}`].dataType = column.dataType;
          // reset filters
          if (
            axis === webTypes.constants.AXIS.Z &&
            (column.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
              column.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE)
          ) {
            draft.state.properties[`${axis}`].accumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.COUNT;
          }
          // set default dateGrouping
          if (column.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE) {
            draft.state.properties[`${axis}`].dateGrouping =
              glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR;
          }
          if (
            column.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
            column.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE
          ) {
            draft.state.properties[`${axis}`].filter = {keywords: []};
          } else {
            draft.state.properties[`${axis}`].filter = {min: 0, max: 0};
          }
        })
      );
    },
    [setProject]
  );

  return {
    handleDrop,
  };
};
