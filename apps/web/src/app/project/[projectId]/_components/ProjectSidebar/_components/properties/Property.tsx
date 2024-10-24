'use client';
import {useCallback} from 'react';
import {useDrop} from 'react-dnd';
import {useRecoilState, useRecoilValue} from 'recoil';
import {webTypes, fileIngestionTypes} from 'types';
import {AxesIcons} from '../icons/AxesIcons';
import {useProject} from 'services';
import {handleDataType} from 'lib/client/helpers/handleDataType';
// state
import {projectAtom, singlePropertySelectorFamily} from 'state/project';
// icons
import ClearIcon from 'svg/clear-icon.svg';
import LinIcon from 'svg/lin-icon.svg';
import LogIcon from 'svg/log-icon.svg';
import SwapLeftIcon from 'svg/swap-left-icon.svg';
import SwapRightIcon from 'svg/swap-right-icon.svg';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {modelRunnerSelector, showLoadingAtom} from 'state';
import AccumulatorType from './AccumulatorListbox';
import DateGroupingListbox from './DateGroupListbox';

export const Property = ({axis}) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const modelRunner = useRecoilValue(modelRunnerSelector);
  const prop = useRecoilValue(singlePropertySelectorFamily(axis));
  const {handleDrop} = useProject();

  const [{isOver, canDrop}, drop] = useDrop({
    accept: prop.accepts,
    drop: (item) => handleDrop(axis, item, project, false),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;
  const showLoadingValue = useRecoilValue(showLoadingAtom);
  const showLoading = Object.keys(showLoadingValue).length > 0 ? true : false;

  const clearProp = useCallback(async () => {
    setProject(
      produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
        draft.state.properties[`${axis}`] = {
          axis: axis,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: `Column ${axis}`, //corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, //corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        };
      })
    );
  }, [axis, setProject]);

  const logLin = useCallback(() => {
    setProject(
      produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
        draft.state.properties[`${axis}`].interpolation =
          prop.interpolation === webTypes.constants.INTERPOLATION_TYPE.LIN
            ? webTypes.constants.INTERPOLATION_TYPE.LOG
            : webTypes.constants.INTERPOLATION_TYPE.LIN;
      })
    );

    // NOTE: rust has integer values instead of the ts enum values
    const config = {
      [`${axis.toLowerCase()}_interpolation`]:
        prop.interpolation === webTypes.constants.INTERPOLATION_TYPE.LIN
          ? webTypes.constants.INTERPOLATION_TYPE.LOG
          : webTypes.constants.INTERPOLATION_TYPE.LIN,
    };
    modelRunner.update_configuration(JSON.stringify(config), true);
  }, [setProject, axis, prop.interpolation, modelRunner]);

  const ascDesc = useCallback(() => {
    setProject(
      produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
        draft.state.properties[`${axis}`].direction =
          prop.direction === webTypes.constants.DIRECTION_TYPE.ASC
            ? webTypes.constants.DIRECTION_TYPE.DESC
            : webTypes.constants.DIRECTION_TYPE.ASC;
      })
    );

    // NOTE: rust has integer values instead of the ts enum values
    const config = {
      [`${axis.toLowerCase()}_order`]:
        prop.direction === webTypes.constants.DIRECTION_TYPE.ASC
          ? webTypes.constants.DIRECTION_TYPE.DESC
          : webTypes.constants.DIRECTION_TYPE.ASC,
    };
    modelRunner.update_configuration(JSON.stringify(config), true);
  }, [axis, modelRunner, prop.direction, setProject]);

  return (
    <li
      ref={drop}
      className="relative py-1 px-2 group-props last:mb-0 bg-transparent hover:bg-secondary-midnight flex flex-col space-y-1"
    >
      <div className="group/axes flex gap-x-2 items-center w-full">
        {/* AXES ICON */}
        <div
          className={`bg-secondary-space-blue border border-transparent ${
            showLoading ? '' : 'hover:border-white'
          } p-0 rounded`}
        >
          <div className="h-4 group">
            <div className="flex group-hover:hidden">
              <AxesIcons property={axis} />
            </div>
            <div onClick={clearProp} className="group-hover:flex hidden">
              <ClearIcon />
            </div>
          </div>
        </div>
        {/* AXES CHIP */}
        {isActive ? (
          <div className="block grow text-gray hover:text-gray transition duration-150 truncate">
            <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">
              release to drop
            </span>
          </div>
        ) : (
          <div
            data-type={handleDataType(prop, project)}
            className={`flex min-w-[8rem] grow text-white justify-center h-4 bg-gray transition duration-150 truncate cursor-pointer rounded`}
          >
            <span className="inline-flex uppercase align-middle items-center text-center truncate leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium lg:opacity-100 2xl:opacity-100 duration-200">
              {prop?.key}
            </span>
            <div className="hidden group-hover/axes:flex absolute top-8 z-40 px-2 py-1right-2 bg-primary-dark-blue text-white">
              {prop?.description || 'description'}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-x-2 items-center">
        {/* LIN/LOG BUTTON */}
        <div
          onClick={logLin}
          className="flex items-center justify-center bg-secondary-dark-blue border border-transparent rounded opacity-100 hover:border-white hover:cursor-pointer w-1/2"
        >
          {prop.interpolation === webTypes.constants.INTERPOLATION_TYPE.LIN ? <LinIcon /> : <LogIcon />}
        </div>
        {/* DIRECTION BUTTON */}
        <div
          onClick={ascDesc}
          className={`flex items-center justify-center bg-secondary-dark-blue border border-transparent w-1/2 rounded ${
            showLoading ? 'opacity-30' : 'opacity-100 hover:border-white hover:cursor-pointer'
          }`}
        >
          {/* border on same elements as heigh and witg */}
          {prop.direction === webTypes.constants.DIRECTION_TYPE.ASC ? <SwapLeftIcon /> : <SwapRightIcon />}
        </div>
        {/* TODO: use the project docId to determine version */}
        <div className="relative">
          {(axis === 'X' || axis === 'Y') && prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE && (
            <DateGroupingListbox axis={axis} />
          )}
        </div>
        {axis === 'Z' && <AccumulatorType axis={axis} />}
      </div>
    </li>
  );
};
