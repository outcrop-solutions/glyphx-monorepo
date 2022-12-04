import { rowsSelector, columnsSelector } from "@/state/files";
import React, { useEffect, useState } from "react";
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
  shareOpenAtom,
  showNotificationAtom
} from "state";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const cols = useRecoilValue(columnsSelector);
  var r = document.querySelector(':root');
  const orientation = useRecoilValue(orientationAtom);
  const stdName = useRecoilValue(sdtValue);
  const glyphxViewer = useRecoilValue(glyphViewerDetails);
  const isInfoOpen = useRecoilValue(showInfoAtom);
  const isShareOpen = useRecoilValue(shareOpenAtom);
  const isNotificationOpen = useRecoilValue(showNotificationAtom);
  const [localSize, setSize] = useState(null); //set a local size state
  const [localOrientation, setLocalOrientation] = useState("horizontal");

  function startDrag() {
    try { //hide glyph viewer
      //@ts-ignore
      window?.core.ToggleDrawer(false);
    } catch (error) {
      console.log({ error })
    }
  }

  function completedDrag(size) {
    setSize(size);
    doResize(size);
    try { //show glyph viewer
      //@ts-ignore
      window?.core.ToggleDrawer(true);
    } catch (error) {
      console.log({ error })
    }
  }

  function onDragChange(size) {
    setSize(size);
  }

  function doResize(size) {


    try {
      //@ts-ignore
      // window?.core.ToggleDrawer(true);
      if (orientation === "horizontal") {
        var yValue = size + Math.abs(Math.round(window.innerHeight * 0.882) - 700);
        var heightValue = Math.abs(size - Math.abs(Math.round(window.innerHeight * 0.157) + 700));
        var leftSide = window.innerWidth;
        if (isShareOpen || isInfoOpen || isNotificationOpen) {
          leftSide = leftSide - 250;
        }

        console.log(JSON.stringify({
          filterSidebar: {
            y: yValue, //843 
            right: 335,
            height: heightValue,
          },
          commentsSidebar: {
            left: leftSide
          }
        }))
        //@ts-ignore
        window?.core.ResizeEvent(
          JSON.stringify({
            filterSidebar: {
              y: yValue, //843 
              right: 335,
              height: heightValue,
            },
            commentsSidebar: {
              left: leftSide
            }
          })
        );
      }
      else {
        console.log({ size })
        var rightValue = size + 335;
        var leftSide = window.innerWidth;
        if (isShareOpen || isInfoOpen || isNotificationOpen || true) {
          leftSide = leftSide - 250;
        }
        // @ts-ignore
        window?.core.ResizeEvent(
          JSON.stringify({
            filterSidebar: {
              right: rightValue,
              height: window.innerWidth,
              y: 150
            },
            commentsSidebar: {
              left: leftSide
            }
          })
        );
      }



    } catch (error) {
      console.log({ error })
    }
  }

  // TODO: LOOK AT IMMUTABLE UPDATE

  //kicks in on orientation change
  useEffect(() => {
    if (orientation !== localOrientation) {
      doResize(localSize);
      setLocalOrientation(orientation);
    }
    
    // console.log({ColumnLength: cols?.length});
    //@ts-ignore
    r.style.setProperty('--screen', `${window.innerHeight}px`);
    if (cols?.length > 0) {
      //@ts-ignore
      r.style.setProperty('--col', cols.length); //set the column length to column length of csv for globals.css
    }

    // Resize grid if right sidebar is open
    if (isShareOpen || isInfoOpen || isNotificationOpen) {
      if (orientation === "vertical") {
        //@ts-ignore
        r.style.setProperty('--width', `${localSize}px`); //set width of grid to the size of pane
      } else {
        //@ts-ignore
        r.style.setProperty('--width', `${Math.round(window.innerWidth - 192 - 350)}px`); //set width of grid to size between right sidebar and left content
      }
    }
    else {
      if (orientation === "vertical") {
        //@ts-ignore
        r.style.setProperty('--width', `${localSize}px`); //set width of grid to the size of pane
      } else {
        //@ts-ignore
        r.style.setProperty('--width', `${Math.round(window.innerWidth - 300)}px`); //set width of grid to size between right sidebar and left content
      }
    }

  }, [orientation, isInfoOpen, isShareOpen, isNotificationOpen, localSize, cols])

  return (
    <>
      {rows?.length > 0 ? (
        <>
          {
            stdName !== null ?
              <div className="">
                <SplitPane
                  split={orientation === "horizontal" ? "horizontal" : "vertical"}
                  allowResize={true} defaultSize={700}
                  maxSize={orientation === "horizontal" ? 700 : window.innerWidth - 40 - 192 - 600}
                  minSize={orientation === "horizontal" ? null : 200}
                  onDragStarted={startDrag}
                  onDragFinished={completedDrag}
                  onChange={onDragChange}
                  primary={"first"}>
                  {/* <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full mr-[15.5rem]' : 'h-full ml-64'} overflow-scroll`}> */}
                  <div className={`flex flex-col ${orientation === "vertical" ? `h-[93vh]` : ``}`}>
                    <GridHeader />
                    <Datagrid isDropped={isDropped} />
                  </div>
                  {/* <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full' : 'h-full'}`}> */}
                  <div className={`flex flex-col`}>
                    <ModelFooter />
                  </div>
                </SplitPane>
              </div>
              :
              (
                <div className={`flex flex-col h-full w-full `}>
                  <GridHeader />
                  <Datagrid isDropped={isDropped} />
                </div>
              )
          }
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
