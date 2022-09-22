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
        <SplitPane split={orientation === "horizontal" ? "horizontal" : "vertical"} allowResize={true} defaultSize={700} primary={"first"}>
        <div className="flex flex-col grow max-h-full">
            <Datagrid isDropped={isDropped} />
            {/* <ModelFooter /> */}
          </div>
          <div className="flex flex-col grow max-h-full">
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
