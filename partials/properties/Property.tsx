import { useDrop } from "react-dnd";
import { AxesIcons } from "../filters/AxesIcons";


export const Property = ({ axis, accept, lastDroppedItem, onDrop }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;

  return (
    <li
      ref={drop}
      className="py-2 pl-2 group-props last:mb-0 flex items-center"
    >
      <AxesIcons property={axis} />
      {isActive ? (
        <div className="block text-gray hover:text-gray transition duration-150 truncate">
          <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">
            release to drop
          </span>
        </div>
      ) : (
        <div
          // @ts-ignore
          formattype={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex justify-center h-4 ml-4 bg-gray group-props-hover:text-gray transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="text-xs font-medium mx-6 lg:opacity-100 2xl:opacity-100 duration-200">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
      )}
      <div className="flex ml-3">
        <div>
          <p className="text-xs text-white mr-5 hover:mr-4 hover:border-2 hover:border-white hover:p-1 hover:rounded-full hover:text-[0.5rem] hover:cursor-pointer">
            LIN
          </p>
        </div>
        <div className="hover:border-2 hover:border-white hover:p-1 hover:pt-2 hover:rounded-full">
          <svg className="h-2 w-5" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99559 3.90785L0.0973041 5.68086C-0.0324347 5.80796 -0.0324347 6.00496 0.0973041 6.13206L1.99559 7.90506C2.20727 8.10842 2.576 7.96226 2.576 7.68264V6.53877H6.67984C7.0554 6.53877 7.36268 6.2528 7.36268 5.90328C7.36268 5.55376 7.0554 5.26779 6.67984 5.26779H2.576V4.13027C2.576 3.84431 2.20727 3.7045 1.99559 3.90785ZM11.9035 1.86794L10.0053 0.0949382C9.79357 -0.108417 9.42484 0.0377444 9.42484 0.317358V1.45488H5.31417C4.93861 1.45488 4.63133 1.74085 4.63133 2.09036C4.63133 2.43988 4.93861 2.72585 5.31417 2.72585H9.41801V3.86337C9.41801 4.14934 9.78674 4.28915 9.99842 4.08579L11.8967 2.31278C12.0333 2.19204 12.0333 1.98869 11.9035 1.86794Z" fill="#CECECE" />
          </svg>
        </div>

      </div>
    </li>
  );
};
