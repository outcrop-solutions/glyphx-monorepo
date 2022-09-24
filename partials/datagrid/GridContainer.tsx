import { rowsSelector } from "@/state/files";
import React from "react";
import { useRecoilValue } from "recoil";
import { AddFiles } from "../files";
import { Datagrid } from "./DataGrid";
import { ModelFooter } from "./ModelFooter";
import SplitPane from 'react-split-pane';

import {orientationAtom} from "state";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const orientation = useRecoilValue(orientationAtom);
  
  return (
    <>
      {rows?.length > 0 ? (
        <>
        <SplitPane 
          split={orientation === "horizontal" ? "horizontal" : "vertical"} 
          allowResize={true} defaultSize={700} 
          maxSize={orientation === "horizontal" ? 700: null} 
          minSize={orientation === "horizontal" ? null: 270}
          primary={"first"}>
        <div className={`flex flex-col grow  ${orientation === "horizontal" ? 'max-h-full mr-[15.5rem]' : 'h-full ml-64'} overflow-scroll`}>
            <Datagrid isDropped={isDropped} />
            {/* <ModelFooter /> */}
          </div>
          <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full' : 'h-full'}`}>
            {/* <Datagrid isDropped={isDropped} /> */}
            <ModelFooter />
          </div>

        </SplitPane>
          
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
