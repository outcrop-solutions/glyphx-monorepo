import { useState } from "react";
import { useDrop } from "react-dnd";
import { AxesIcons } from "../filters/AxesIcons";
import { AxisInterpolationAtom,AxisDirectionAtom } from "@/state/properties";
import { useRecoilState } from "recoil";


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
  const [isLIN, setLIN] = useState(true); //true is LIN false is LOG
  const [swap, setSwap] = useState(true); //true is orignal, false is reversed
  const [clearAxis, setClearAxis] = useState(false); //true means show X false means show axis

  const [AxisInterpolation,setAxisInterpolation] = useRecoilState(AxisInterpolationAtom); // recoil state for axis type 
  const [AxisDirection,setAxisDirection] = useRecoilState(AxisDirectionAtom); // recoil state for axis direction 

  /**
   * Assign value of axis type to the atom
   * @param value 
   */
  function assignInterpolation(value){
    if(value){
      setAxisInterpolation(prev =>{
        let data = {...prev}
        data[axis] = "LIN"
        return data
      });
    }
    else{
      setAxisInterpolation(prev =>{
        let data = {...prev}
        data[axis] = "LOG"
        return data
      });
    }
  }

  /**
   * Assign value of axis direction to the atom
   * @param value 
   */
  function assignDirection(value){
    if(value){
      setAxisDirection(prev =>{
        let data = {...prev}
        data[axis] = "ASC"
        return data
      });
    }
    else{
      setAxisDirection(prev =>{
        let data = {...prev}
        data[axis] = "DESC"
        return data
      });
    }
  }

  function change_LOG_LIN() {
    if(lastDroppedItem.dataType !== "string"){ // if it is not a string then we can change default interpolation
      assignInterpolation(!isLIN);
      setLIN(!isLIN);
    }
    
  }

  function change_SWAP() {
    assignDirection(!swap);
    setSwap(!swap);
  }

  function clearPressed(){
    console.log("Clear pressed for",axis);
    //set last dropped to empty
  }

  function showClear() {
    setClearAxis(true);
  }

  function hideClear() {
    setClearAxis(false);
  }

  return (
    <li
      ref={drop}
      className="py-2 pl-2 group-props last:mb-0 flex items-center hover:bg-secondary-midnight"
      onMouseOver={showClear}
      onMouseOut={hideClear}
    >
      <div className="bg-secondary-space-blue border-2 border-transparent hover:border-white p-0 rounded-full">
        {
          !clearAxis ?
            <AxesIcons property={axis} />
            :
            <div onClick={clearPressed}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.7782 3.22943C12.4824 2.93364 12.0045 2.93364 11.7088 3.22943L8 6.9306L4.29124 3.22184C3.99545 2.92605 3.51763 2.92605 3.22184 3.22184C2.92605 3.51763 2.92605 3.99545 3.22184 4.29124L6.9306 8L3.22184 11.7088C2.92605 12.0045 2.92605 12.4824 3.22184 12.7782C3.51763 13.0739 3.99545 13.0739 4.29124 12.7782L8 9.0694L11.7088 12.7782C12.0045 13.0739 12.4824 13.0739 12.7782 12.7782C13.0739 12.4824 13.0739 12.0045 12.7782 11.7088L9.0694 8L12.7782 4.29124C13.0664 4.00303 13.0664 3.51763 12.7782 3.22943Z" fill="white" />
            </svg>
            </div>
            
        }
      </div>
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
          className={`flex min-w-[8rem] text-white uppercase justify-center h-4 ml-4 bg-gray group-props-hover:text-black transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="truncate text-xs font-medium mx-6 lg:opacity-100 2xl:opacity-100 duration-200">
            {/* trancate or wrap */}
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
      )}
      <div className="flex ml-3 space-x-1">
        <div onClick={change_LOG_LIN} className="flex items-center justify-center bg-secondary-space-blue border-2 border-transparent hover:border-white p-0 rounded-full hover:cursor-pointer">

          {
            isLIN ?
              <svg width="25" height="25" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1610_8514)">
                  <path d="M4.27086 10C4.11886 10 4.00086 9.958 3.91686 9.874C3.83686 9.79 3.79686 9.674 3.79686 9.526V6.232C3.79686 6.076 3.83686 5.958 3.91686 5.878C3.99686 5.798 4.11286 5.758 4.26486 5.758C4.41286 5.758 4.52686 5.798 4.60686 5.878C4.68686 5.958 4.72686 6.076 4.72686 6.232V9.214H6.33486C6.46286 9.214 6.56086 9.248 6.62886 9.316C6.70086 9.384 6.73686 9.48 6.73686 9.604C6.73686 9.732 6.70086 9.83 6.62886 9.898C6.56086 9.966 6.46286 10 6.33486 10H4.27086ZM7.46431 10.054C7.31231 10.054 7.19631 10.012 7.11631 9.928C7.03631 9.844 6.99631 9.726 6.99631 9.574V6.196C6.99631 6.044 7.03631 5.926 7.11631 5.842C7.19631 5.758 7.31231 5.716 7.46431 5.716C7.61231 5.716 7.72631 5.758 7.80631 5.842C7.88631 5.926 7.92631 6.044 7.92631 6.196V9.574C7.92631 9.726 7.88631 9.844 7.80631 9.928C7.73031 10.012 7.61631 10.054 7.46431 10.054ZM8.96956 10.054C8.82956 10.054 8.72156 10.016 8.64556 9.94C8.57356 9.86 8.53756 9.748 8.53756 9.604V6.184C8.53756 6.032 8.57356 5.916 8.64556 5.836C8.72156 5.756 8.82156 5.716 8.94556 5.716C9.05356 5.716 9.13556 5.738 9.19156 5.782C9.25156 5.822 9.31956 5.89 9.39556 5.986L11.5016 8.668H11.3396V6.16C11.3396 6.02 11.3756 5.912 11.4476 5.836C11.5236 5.756 11.6316 5.716 11.7716 5.716C11.9116 5.716 12.0176 5.756 12.0896 5.836C12.1656 5.912 12.2036 6.02 12.2036 6.16V9.622C12.2036 9.754 12.1696 9.86 12.1016 9.94C12.0336 10.016 11.9416 10.054 11.8256 10.054C11.7136 10.054 11.6236 10.032 11.5556 9.988C11.4916 9.944 11.4216 9.874 11.3456 9.778L9.24556 7.096H9.40156V9.604C9.40156 9.748 9.36556 9.86 9.29356 9.94C9.22156 10.016 9.11356 10.054 8.96956 10.054Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_1610_8514">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              :
              <svg width="25" height="25" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1610_8515)">
                  <path d="M3.1632 10C3.0112 10 2.8932 9.958 2.8092 9.874C2.7292 9.79 2.6892 9.674 2.6892 9.526V6.232C2.6892 6.076 2.7292 5.958 2.8092 5.878C2.8892 5.798 3.0052 5.758 3.1572 5.758C3.3052 5.758 3.4192 5.798 3.4992 5.878C3.5792 5.958 3.6192 6.076 3.6192 6.232V9.214H5.2272C5.3552 9.214 5.4532 9.248 5.5212 9.316C5.5932 9.384 5.6292 9.48 5.6292 9.604C5.6292 9.732 5.5932 9.83 5.5212 9.898C5.4532 9.966 5.3552 10 5.2272 10H3.1632ZM7.37628 10.066C6.96028 10.066 6.59428 9.976 6.27828 9.796C5.96628 9.612 5.72228 9.356 5.54628 9.028C5.37428 8.7 5.28828 8.318 5.28828 7.882C5.28828 7.55 5.33628 7.252 5.43228 6.988C5.53228 6.72 5.67428 6.492 5.85828 6.304C6.04228 6.112 6.26228 5.964 6.51828 5.86C6.77828 5.756 7.06428 5.704 7.37628 5.704C7.80028 5.704 8.16828 5.794 8.48028 5.974C8.79228 6.154 9.03428 6.408 9.20628 6.736C9.38228 7.06 9.47028 7.44 9.47028 7.876C9.47028 8.208 9.42028 8.508 9.32028 8.776C9.22028 9.044 9.07828 9.274 8.89428 9.466C8.71028 9.658 8.49028 9.806 8.23428 9.91C7.97828 10.014 7.69228 10.066 7.37628 10.066ZM7.37628 9.274C7.61228 9.274 7.81228 9.22 7.97628 9.112C8.14428 9 8.27228 8.84 8.36028 8.632C8.45228 8.42 8.49828 8.17 8.49828 7.882C8.49828 7.442 8.40028 7.102 8.20428 6.862C8.00828 6.618 7.73228 6.496 7.37628 6.496C7.14428 6.496 6.94428 6.55 6.77628 6.658C6.60828 6.766 6.48028 6.924 6.39228 7.132C6.30428 7.34 6.26028 7.59 6.26028 7.882C6.26028 8.318 6.35828 8.66 6.55428 8.908C6.75028 9.152 7.02428 9.274 7.37628 9.274ZM11.8037 10.066C11.3277 10.066 10.9237 9.976 10.5917 9.796C10.2637 9.616 10.0137 9.364 9.84167 9.04C9.66967 8.716 9.58367 8.336 9.58367 7.9C9.58367 7.564 9.63367 7.262 9.73367 6.994C9.83767 6.722 9.98567 6.492 10.1777 6.304C10.3737 6.112 10.6097 5.964 10.8857 5.86C11.1657 5.756 11.4817 5.704 11.8337 5.704C12.0497 5.704 12.2657 5.728 12.4817 5.776C12.6977 5.824 12.9057 5.904 13.1057 6.016C13.1897 6.064 13.2457 6.126 13.2737 6.202C13.3057 6.274 13.3137 6.352 13.2977 6.436C13.2857 6.516 13.2537 6.588 13.2017 6.652C13.1537 6.712 13.0897 6.752 13.0097 6.772C12.9337 6.788 12.8457 6.772 12.7457 6.724C12.6137 6.652 12.4737 6.6 12.3257 6.568C12.1777 6.532 12.0157 6.514 11.8397 6.514C11.5557 6.514 11.3177 6.568 11.1257 6.676C10.9337 6.78 10.7897 6.936 10.6937 7.144C10.6017 7.348 10.5557 7.6 10.5557 7.9C10.5557 8.352 10.6637 8.694 10.8797 8.926C11.0997 9.158 11.4237 9.274 11.8517 9.274C11.9957 9.274 12.1437 9.26 12.2957 9.232C12.4477 9.204 12.5977 9.164 12.7457 9.112L12.5717 9.49V8.338H12.0317C11.9117 8.338 11.8197 8.308 11.7557 8.248C11.6917 8.188 11.6597 8.106 11.6597 8.002C11.6597 7.894 11.6917 7.812 11.7557 7.756C11.8197 7.696 11.9117 7.666 12.0317 7.666H12.9737C13.0937 7.666 13.1837 7.698 13.2437 7.762C13.3077 7.826 13.3397 7.918 13.3397 8.038V9.43C13.3397 9.534 13.3197 9.622 13.2797 9.694C13.2397 9.766 13.1717 9.818 13.0757 9.85C12.8957 9.914 12.6937 9.966 12.4697 10.006C12.2457 10.046 12.0237 10.066 11.8037 10.066Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_1610_8515">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>

          }


        </div>
        <div onClick={change_SWAP} className="flex items-center justify-center bg-secondary-space-blue border-2 border-transparent hover:border-white rounded-full p-1 hover:cursor-pointer">
          {/* border on same elements as heigh and witg */}
          {
            swap ?
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.99559 7.90785L2.0973 9.68086C1.96757 9.80796 1.96757 10.005 2.0973 10.1321L3.99559 11.9051C4.20727 12.1084 4.576 11.9623 4.576 11.6826V10.5388H8.67984C9.0554 10.5388 9.36268 10.2528 9.36268 9.90328C9.36268 9.55376 9.0554 9.26779 8.67984 9.26779H4.576V8.13027C4.576 7.84431 4.20727 7.7045 3.99559 7.90785ZM13.9035 5.86794L12.0053 4.09494C11.7936 3.89158 11.4248 4.03774 11.4248 4.31736V5.45488H7.31417C6.93861 5.45488 6.63133 5.74085 6.63133 6.09036C6.63133 6.43988 6.93861 6.72585 7.31417 6.72585H11.418V7.86337C11.418 8.14934 11.7867 8.28915 11.9984 8.08579L13.8967 6.31278C14.0333 6.19204 14.0333 5.98869 13.9035 5.86794Z" fill="white" />
              </svg>
              :

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.99559 8.09215L2.0973 6.31914C1.96757 6.19204 1.96757 5.99504 2.0973 5.86794L3.99559 4.09494C4.20727 3.89158 4.576 4.03774 4.576 4.31736V5.46123H8.67984C9.0554 5.46123 9.36268 5.7472 9.36268 6.09672C9.36268 6.44624 9.0554 6.73221 8.67984 6.73221H4.576V7.86973C4.576 8.15569 4.20727 8.2955 3.99559 8.09215ZM13.9035 10.1321L12.0053 11.9051C11.7936 12.1084 11.4248 11.9623 11.4248 11.6826V10.5451H7.31417C6.93861 10.5451 6.63133 10.2592 6.63133 9.90964C6.63133 9.56012 6.93861 9.27415 7.31417 9.27415H11.418V8.13663C11.418 7.85066 11.7867 7.71085 11.9984 7.91421L13.8967 9.68722C14.0333 9.80796 14.0333 10.0113 13.9035 10.1321Z" fill="white" />
              </svg>


          }


        </div>

      </div>
    </li>
  );
};
