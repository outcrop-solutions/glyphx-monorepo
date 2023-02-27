/* eslint-disable no-lone-blocks */
import React, {useState} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { propertiesAtom } from "src/state/properties";
import { Property } from "./Property";

export const Properties = ({ handleDrop }) => {
  const [properties, setProperties] = useRecoilState(propertiesAtom);
  const [isCollapsed, setCollapsed] = useState(false);

  /**
   * TAKES IN AXIS TO CLEAR IN PROPERTIES ATOM
   * @param axis 
   */
  function clearAxis(axis){
    let newObj = null;
    let prev_X = properties[0];
    let prev_Y = properties[1];
    let prev_Z = properties[2];
    let others = properties.slice(3,6);
    switch(axis){
      case "X":
        newObj = [{axis:"X",accepts:"COLUMN_DRAG",lastDroppedItem:null},prev_Y,prev_Z,...others];
        setProperties(newObj);
        break;
      
        case "Y":
          newObj = [prev_X,{axis:"Y",accepts:"COLUMN_DRAG",lastDroppedItem:null},prev_Z,...others];
          setProperties(newObj);
          break;
        
        case "Z":
          newObj = [prev_X,prev_Y,{axis:"Z",accepts:"COLUMN_DRAG",lastDroppedItem:null},...others];
          setProperties(newObj);
          break;

      default:
        break;
    }
  }

  return (
    <React.Fragment>
      <div className="group">
        <summary  className="flex h-8 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:border-b-white hover:text-white truncate border-b border-gray">
          <div onClick={()=>{setCollapsed(!isCollapsed)}} className="flex ml-2 items-center">
            <span className="">
              <svg className={`w-5 h-5 ${isCollapsed ? "-rotate-90": "rotate-180"}`} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray"> Axes </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>
        {
          !isCollapsed ?
          <div className={`block border-b border-gray`}>
          <ul className="py-1">
            {properties?.length > 0
              ? properties.map(({ axis, accepts, lastDroppedItem }, idx) => {
                  if (idx < 3) {
                    return (
                      <Property
                        axis={axis}
                        accept={accepts}
                        lastDroppedItem={lastDroppedItem}
                        onDrop={(item) => handleDrop(idx, item)}
                        key={idx}
                        ClearProperty={clearAxis}
                      />
                    );
                  } else return null;
                })
              : null}
          </ul>
        </div>
          :
          <></>
        }
        
      </div>
    </React.Fragment>
  );
};
