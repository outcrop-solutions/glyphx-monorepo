import { rowsSelector } from "@/state/files";
import React,{useEffect,useState} from "react";
import { useRecoilValue } from "recoil";
import { AddFiles } from "../files";
import { Datagrid } from "./DataGrid";
import { ModelFooter } from "./ModelFooter";
import { GridHeader } from "partials";
import SplitPane from 'react-split-pane';

import { orientationAtom, payloadSelector, glyphViewerDetails } from "state";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const orientation = useRecoilValue(orientationAtom);
  const payload = useRecoilValue(payloadSelector);
  const glyphxViewer = useRecoilValue(glyphViewerDetails);
  const [localSize,setSize] = useState(null);

  function startDrag(){
    try { //hide glyph viewer
      //@ts-ignore
      window?.core.ToggleDrawer(false);
    } catch (error) {
      console.log({error})
    }
  }

  function completedDrag(size){
    console.log({completedDrag: size});
    setSize(size);
    try {
      //@ts-ignore
      window?.core.ToggleDrawer(true);
      if(orientation === "horizontal"){
        //@ts-ignore
      window?.core.ResizeEvent(
        JSON.stringify({
          filterSidebar: {
            // y: filterSidebarPosition.values.y,
            // y: ()=>{return orientation === "horizontal" ? size+150 : size+150}, //pixel value of header height start was 64
            // right: Math.round(glyphxViewer.filterSidebarPosition?.values.right), //left side of browser to right side of project sidebar
            // height: glyphxViewer.filterSidebarPosition?.values.height, // height of grid view window
            right: 335,
            height: 1000,
            y:size+150
          },
          commentsSidebar: glyphxViewer.commentsPosition
            ? glyphxViewer.commentsPosition?.values
            : { ...glyphxViewer.filterSidebarPosition?.values, left: window.innerWidth },
        })
      );
      }
      else{
         //@ts-ignore
      window?.core.ResizeEvent(
        JSON.stringify({
          filterSidebar: {
            // y: filterSidebarPosition.values.y,
            // y: ()=>{return orientation === "horizontal" ? size+150 : size+150}, //pixel value of header height start was 64
            // right: Math.round(glyphxViewer.filterSidebarPosition?.values.right), //left side of browser to right side of project sidebar
            // height: glyphxViewer.filterSidebarPosition?.values.height, // height of grid view window
            right: size+90,
            height: 1000,
            y:150
          },
          commentsSidebar: glyphxViewer.commentsPosition
            ? glyphxViewer.commentsPosition?.values
            : { ...glyphxViewer.filterSidebarPosition?.values, left: window.innerWidth },
        })
      );
      }
      
    } catch (error) {
      console.log({error})
    }
    
  }

  //kicks in on orientation change
  useEffect(()=>{
    if (localSize) {
      completedDrag(localSize);
    }
    
  },[orientation])

  return (
    <>
      {rows?.length > 0 ? (
        <>
        {/* FIXME: FIGURE OUT WHY WHEN FALSE THE TOP HEADER IS NOT VISIBLE */}
          {
            payload.url ?
              <SplitPane
                split={orientation === "horizontal" ? "horizontal" : "vertical"}
                allowResize={true} defaultSize={700}
                maxSize={orientation === "horizontal" ? 700 : null}
                minSize={orientation === "horizontal" ? null : 270}
                onDragStarted={startDrag}
                onDragFinished={completedDrag}
                primary={"first"}>
                <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full mr-[15.5rem]' : 'h-full ml-64'} overflow-scroll`}>
                  <GridHeader />
                  <Datagrid isDropped={isDropped} />
                </div>
                <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full' : 'h-full'}`}>
                  <ModelFooter />
                </div>
              </SplitPane>
              :
              (
                <>
                <GridHeader />
                <div className={`flex flex-col grow h-full w-screen pr-80 `}>
                
                <Datagrid isDropped={isDropped} />
              </div>
                </>
                
              )
              // TODO : FIGURE OUT HOW TO FIX WIDTH SO THAT IT CAN MATCH CONTENT. NEED HELP FROM EXPERT JAMES
              
          }
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
