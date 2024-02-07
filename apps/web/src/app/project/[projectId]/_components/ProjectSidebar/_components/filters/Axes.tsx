'use client';
import {useCallback, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {useDrop} from 'react-dnd';
import {fileIngestionTypes, webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import {RangeFilter} from './actions/RangeFilter';
import {SearchFilter} from './actions/SearchFilter';
import ClearIcon from 'public/svg/clear-icon.svg';

import {AxesIcons} from '../icons/AxesIcons';
import PlusIcon from 'public/svg/plus-icon.svg';
import GarbageIcon from 'public/svg/garbage-can-icon.svg';

import {projectAtom, singlePropertySelectorFamily} from 'state';
import {useProject} from 'services';
import {handleDataType} from 'lib/client/helpers/handleDataType';
import produce from 'immer';

export const Axes = ({axis}) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const prop = useRecoilValue(singlePropertySelectorFamily(axis));
  const [showFilter, setShowFilter] = useState(false); //shows filter property
  const {handleDrop} = useProject();

  // eslint-disable-next-line
  const [_, drop] = useDrop({
    accept: prop.accepts,
    drop: (item) => handleDrop(axis, item, project as webTypes.IHydratedProject, false),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

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

  return (
    <>
      <li
        ref={drop}
        className={`py-0 px-2 group-filters hover:bg-secondary-midnight hover:bg-opacity-70 last:mb-0 flex gap-x-2 items-center h-5`}
      >
        {/* AXES ICON */}
        <div className={`bg-secondary-space-blue border border-transparent hover:border-white p-0 rounded`}>
          <div className="h-4 group">
            <div className="flex group-hover:hidden">
              <AxesIcons property={axis} />
            </div>
            <div onClick={clearProp} className="group-hover:flex hidden">
              <ClearIcon />
            </div>
          </div>
        </div>
        {/* PROPERTY CHIP */}
        <div
          data-type={handleDataType(prop, project)}
          className={`flex grow justify-center bg-gray h-4 truncate cursor-pointer rounded`}
        >
          <span className="inline-flex align-middle items-center text-center text-white leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium uppercase lg:opacity-100 2xl:opacity-100 transition duration-150 truncate">
            {prop?.key || ''}
          </span>
        </div>
        {/* ADD FILTER BTN */}
        <div
          className={`flex justify-between bg-secondary-dark-blue rounded border border-transparent hover:border-white hover:cursor-pointer`}
        >
          {showFilter ? (
            <GarbageIcon onClick={() => setShowFilter(false)} />
          ) : (
            <PlusIcon onClick={() => setShowFilter(true)} />
          )}
        </div>
      </li>
      {/* filtering dropdown */}
      {showFilter && (
        <>
          {prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER ? (
            <RangeFilter prop={prop} />
          ) : (
            <SearchFilter prop={prop} />
          )}
        </>
      )}
    </>
  );
};
