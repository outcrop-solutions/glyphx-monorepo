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

  function startDrag() {
    try { //hide glyph viewer
      //@ts-ignore
      window?.core.ToggleDrawer(false);
    } catch (error) {
      console.log({ error })
    }
  }

  function completedDrag(size) {
    console.log({ completedDrag: size });
    console.log(window.innerWidth - 240);
    console.log({ windowHeight: window.innerHeight });
    console.log({ isShareOpen });
    setSize(size);
    // doResize(size);

  }

  function onDragChange(size) {
    setSize(size);
  }

  function doResize(size) {

    var leftSide = window.innerWidth;

    if (isShareOpen) {
      leftSide = leftSide - 350;
    }

    if (isInfoOpen) {
      leftSide = leftSide - 300
    }



    try {
      //@ts-ignore
      window?.core.ToggleDrawer(true);
      if (orientation === "horizontal") {
        //@ts-ignore
        window?.core.ResizeEvent(
          JSON.stringify({
            filterSidebar: {
              right: 335,
              height: size + 150,
              y: size + 150
            },
            commentsSidebar: {
              left: leftSide
            }
          })
        );
        console.log("Horizontal:", { left: leftSide, right: 335, height: window.innerWidth, y: size + 150 });
      }
      else {

        console.log(size + 90);
        console.log({ size })

        //@ts-ignore
        window?.core.ResizeEvent(
          JSON.stringify({
            filterSidebar: {
              right: size + 90 < 500 ? 580 : size + 90,
              height: window.innerWidth,
              y: 150
            },
            commentsSidebar: {
              left: leftSide
            }
          })
        );
        console.log("Vertical:", { left: leftSide, right: size + 90 < 500 ? 580 : size + 90, height: window.innerWidth, y: 150 });
      }

    } catch (error) {
      console.log({ error })
    }
  }

  // LOOK AT IMMUTABLE UPDATE

  //kicks in on orientation change
  useEffect(() => {
    // console.log({ColumnLength: cols?.length});
    //@ts-ignore
    r.style.setProperty('--screen', `${window.innerHeight}px`);
    if (cols?.length > 0) {
      //@ts-ignore
      r.style.setProperty('--col', cols.length); //set the column length to column length of csv for globals.css
    }
    if ((localSize || isInfoOpen || isShareOpen) && stdName !== null) {
      console.log("ABOUT TO ALL DO RESIZE")
      // doResize(localSize);
    }

    // Resize grid if right sidebar is open
    if (isShareOpen || isInfoOpen || isNotificationOpen) {
      if (orientation === "vertical") {
        //@ts-ignore
        r.style.setProperty('--width', `${localSize}px`);
      } else {
        //@ts-ignore
        r.style.setProperty('--width', `${Math.round(window.innerWidth - 40 - 192 - 350)}px`);
      }
    }
    else {
      if (orientation === "vertical") {
        //@ts-ignore
        r.style.setProperty('--width', `${localSize}px`);
      } else {
        //@ts-ignore
        r.style.setProperty('--width', `${Math.round(window.innerWidth - 40 - 300)}px`);
      }
    }

  }, [orientation, isInfoOpen, isShareOpen, isNotificationOpen, localSize, cols])

  return (
    <>
      {rows?.length > 0 ? (
        <>
          {/* FIXME: FIGURE OUT FIX FOR GRID */}
          {
            stdName !== null ?
              <div className="">
                <SplitPane
                  split={orientation === "horizontal" ? "horizontal" : "vertical"}
                  allowResize={true} defaultSize={700}
                  maxSize={orientation === "horizontal" ? 700 : window.innerWidth - 40 -192 - 600}
                  minSize={orientation === "horizontal" ? null : 200}
                  onDragStarted={startDrag}
                  onDragFinished={completedDrag}
                  onChange={onDragChange}
                  primary={"first"}>
                  {/* <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full mr-[15.5rem]' : 'h-full ml-64'} overflow-scroll`}> */}
                  <div className={`flex flex-col ${orientation === "vertical" ? `h-[95vh]` : null}`}>
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
            // TODO : FIGURE OUT HOW TO FIX WIDTH SO THAT IT CAN MATCH CONTENT. NEED HELP FROM EXPERT JAMES

          }
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
