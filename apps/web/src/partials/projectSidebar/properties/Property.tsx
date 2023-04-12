import { useDrop } from 'react-dnd';
import { useRecoilValue } from 'recoil';
import { web as webTypes } from '@glyphx/types';
import { AxesIcons } from '../../icons/AxesIcons';

import { useProject } from 'services';
import { handleDataType } from 'lib/client/helpers/handleDataType';

// state
import { showModelCreationLoadingAtom } from 'state/ui';
import { projectAtom, singlePropertySelectorFamily } from 'state/project';

import ClearIcon from 'public/svg/clear-icon.svg';
import LinIcon from 'public/svg/lin-icon.svg';
import LogIcon from 'public/svg/log-icon.svg';
import SwapLeftIcon from 'public/svg/swap-left-icon.svg';
import SwapRightIcon from 'public/svg/swap-right-icon.svg';

export const Property = ({ axis }) => {
  const project = useRecoilValue(projectAtom);
  const prop = useRecoilValue(singlePropertySelectorFamily(axis));
  const { handleDrop } = useProject();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: prop.accepts,
    drop: (item) => handleDrop(axis, item, project),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;
  const isCreatingModel = useRecoilValue(showModelCreationLoadingAtom);

  const logLin = () => {};

  const ascDesc = () => {};

  return (
    <li
      ref={drop}
      className="py-0 px-2 group-props last:mb-0 flex gap-x-2 items-center bg-transparent hover:bg-secondary-midnight h-5"
    >
      {/* AXES ICON */}
      <div
        className={`bg-secondary-space-blue border border-transparent ${
          isCreatingModel ? '' : 'hover:border-white'
        } p-0 rounded`}
      >
        <div className="h-4 group">
          <div className="flex group-hover:hidden">
            <AxesIcons property={axis} />
          </div>
          <div className="group-hover:flex hidden">
            <ClearIcon />
          </div>
        </div>
      </div>
      {/* AXES CHIP */}
      {isActive ? (
        <div className="block grow text-gray hover:text-gray transition duration-150 truncate">
          <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">release to drop</span>
        </div>
      ) : (
        <div
          data-type={handleDataType(prop)}
          className={`flex min-w-[8rem] grow text-white uppercase justify-center h-4 bg-gray transition duration-150 truncate cursor-pointer rounded`}
        >
          <span className="inline-flex align-middle items-center text-center truncate leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium lg:opacity-100 2xl:opacity-100 duration-200">
            {prop?.key}
          </span>
        </div>
      )}

      {/* LIN/LOG BUTTON */}
      <div
        onClick={logLin}
        className="flex items-center justify-center bg-secondary-space-blue border border-transparent rounded opacity-100 hover:border-white hover:cursor-pointer"
      >
        {prop.interpolation === webTypes.constants.INTERPOLATION_TYPE.LIN ? <LinIcon /> : <LogIcon />}
      </div>
      {/* DIRECTION BUTTON */}
      <div
        onClick={ascDesc}
        className={`flex items-center justify-center bg-secondary-space-blue border border-transparent rounded ${
          isCreatingModel ? 'opacity-30' : 'opacity-100 hover:border-white hover:cursor-pointer'
        }`}
      >
        {/* border on same elements as heigh and witg */}
        {prop.direction === webTypes.constants.DIRECTION_TYPE.ASC ? <SwapLeftIcon /> : <SwapRightIcon />}
      </div>
    </li>
  );
};
