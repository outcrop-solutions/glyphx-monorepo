import { useRef, useEffect, useState } from "react";
// import { ExpandCollapse } from "./ExpandCollapse";
import { Files, States, Properties as Axes, Filters, Visualizations, VisualizationProps } from "partials";
import { usePosition } from "services/usePosition";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { glyphViewerDetails } from "@/state/globals";

export const ProjectSidebar = ({
  error,
  // setFilterSidebarPosition,
  handleDrop,
  toastRef,
}) => {
  const router = useRouter();
  const { id: projectId } = router.query;

  //utilities
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);

  const [glyphxDetails,setGlyphxViewer] = useRecoilState(glyphViewerDetails);

  /**
   * 0: Project
   * 1: Model
   * 2: Visuals
   */
  const [selectedMenu, setMenu] = useState(0); //sets menu index

  // set projectsSidebar position on transition
  useEffect(() => {
      if (sidebar.current !== null) {
        setGlyphxViewer({
          ...glyphxDetails,
          filterSidebarPosition: {
            values: sidebar.current.getBoundingClientRect(),
          }
        })
        
      }

  }, [projPosition]);

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-secondary-space-blue absolute z-30 left-0 top-0 lg:static border-r border-l border-t border-gray lg:left-auto lg:top-auto  h-full w-full scrollbar-none`}
    >
      <div className="overflow-y-auto w-full scrollbar-none ">
        <Files toastRef={toastRef} />
        <Axes handleDrop={handleDrop} />
        <Filters handleDrop={handleDrop} />
        <States />
      </div>
    </div>
  );

  // FOR LATER VERSION OF PROJECT SIDEBAR
  // return (
  //   <div
  //     id="sidebar"
  //     ref={sidebar}
  //     className={`flex grow flex-col bg-secondary-space-blue absolute z-30 left-0 top-0 lg:static border-r border-l border-t border-gray lg:left-auto lg:top-auto  h-full scrollbar-none w-64 shrink-0`}
  //   >
  //     <div className="overflow-y-auto w-full scrollbar-none">
  //       {/* Files */}
  //       <div className="flex flex-row justify-evenly py-1 hover:cursor-pointer">
  //         <div
  //           onClick={
  //             () => {
  //               setMenu(0)
  //             }
  //           }
  //           className={`justify-center w-1/3 py-2 font-medium text-white text-center border-0 ${selectedMenu === 0 ? "border-b-[1px] border-b-white" : "border-b-[1px] border-b-gray hover:border-b-white"}  bg-transparent hover:bg-secondary-midnight`}>
  //           <p>Project</p>
  //         </div>
  //         <div
  //           onClick={
  //             () => {
  //               setMenu(1)
  //             }
  //           }
  //           className={`justify-center w-1/3 py-2 font-medium text-white text-center border-0 ${selectedMenu === 1 ? "border-b-[1px] border-b-white" : "border-b-[1px] border-b-gray hover:border-b-white"}  bg-transparent hover:bg-secondary-midnight`}>
  //           <p>Model</p>
  //         </div>
  //         <div
  //           onClick={
  //             () => {
  //               setMenu(2)
  //             }
  //           }
  //           className={`justify-center w-1/3 py-2 font-medium text-white text-center border-0 ${selectedMenu === 2 ? "border-b-[1px] border-b-white" : "border-b-[1px] border-b-gray hover:border-b-white"}  bg-transparent hover:bg-secondary-midnight`}>
  //           <p>Visuals</p>
  //         </div>
  //       </div>
  //       {
  //         selectedMenu === 0 && (
  //           <>
  //             <Files toastRef={toastRef} />
  //             <States />
  //           </>

  //         )
  //       }
  //       {
  //         selectedMenu === 1 && (
  //           <>
  //             <Axes handleDrop={handleDrop} />
  //             {error ? (
  //               <div className="btn bg-yellow text-white my-4 w-full">
  //                 {error}
  //               </div>
  //             ) : null}
  //             <Filters projectId={projectId} handleDrop={handleDrop} />
  //           </>

  //         )
  //       }
  //       {
  //         selectedMenu === 2 && (
  //           <>
  //             <Visualizations />
  //             <VisualizationProps/>
  //           </>
  //         )
  //       }
  //     </div>
  //   </div>
  // );

};
