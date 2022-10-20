import { rowsSelector } from "@/state/files";
import React,{useEffect,useState} from "react";
import { useRecoilValue } from "recoil";
import { AddFiles } from "../files";
import { Datagrid } from "./DataGrid";
import { ModelFooter } from "./ModelFooter";
import { GridHeader } from "partials";
import SplitPane from 'react-split-pane';
import { 
  orientationAtom, 
  glyphViewerDetails,
  sdtValue,
  showInfoAtom,
  shareOpenAtom
} from "state";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const orientation = useRecoilValue(orientationAtom);
  const stdName = useRecoilValue(sdtValue);
  const glyphxViewer = useRecoilValue(glyphViewerDetails);
  const isInfoOpen = useRecoilValue(showInfoAtom);
  const isShareOpen = useRecoilValue(shareOpenAtom);
  const [localSize,setSize] = useState(null); //set a local size state

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
    console.log(window.innerWidth - 240);
    console.log({windowHeight: window.innerHeight});
    console.log({isShareOpen});
    setSize(size);
    // doResize(size);
    
  }

  function doResize(size){

    var leftSide = window.innerWidth;

    if(isShareOpen){
      leftSide = leftSide - 350;
    }

    if(isInfoOpen){
      leftSide = leftSide  - 300
    }

    try {
      //@ts-ignore
      window?.core.ToggleDrawer(true);
      if(orientation === "horizontal"){
        //@ts-ignore
      window?.core.ResizeEvent(
        JSON.stringify({
          filterSidebar: {
            right: 335,
            height: window.innerWidth,
            y:size+150
          },
          commentsSidebar :{
            left:leftSide
          }
        })
      );
      }
      else{

        console.log(size+90);
        console.log({size})

         //@ts-ignore
      window?.core.ResizeEvent(
        JSON.stringify({
          filterSidebar: {
            right: size+90 < 500 ? 580 : size+90 ,
            height: window.innerWidth,
            y:150
          },
          commentsSidebar:{
            left:leftSide
          }
        })
      );
      }
      
    } catch (error) {
      console.log({error})
    }
  }

  //kicks in on orientation change
  useEffect(()=>{
    console.log("RERUN USEFFECT");
    if (localSize || isInfoOpen || isShareOpen) {
      console.log("ABOUT TO ALL DO RESIZE")
      doResize(localSize);
    }
    
  },[orientation,isInfoOpen,isShareOpen,localSize])

  return (
    <>
      {rows?.length > 0 ? (
        <>
        {/* FIXME: FIGURE OUT WHY WHEN FALSE THE TOP HEADER IS NOT VISIBLE */}
          {
            stdName !== null ?
              <SplitPane
                split={orientation === "horizontal" ? "horizontal" : "vertical"}
                allowResize={true} defaultSize={700}
                maxSize={orientation === "horizontal" ? 700 : null}
                minSize={orientation === "horizontal" ? null : 500}
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
                
                
                <div className={`flex flex-col h-full w-screen pr-80 `}>
                <GridHeader />
                <Datagrid isDropped={isDropped} />
              </div>
                
                
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
