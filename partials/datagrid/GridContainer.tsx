import { rowsSelector } from "@/state/files";
import React from "react";
import { useRecoilValue } from "recoil";
import { AddFiles } from "../files";
import { Datagrid } from "./DataGrid";
import { ModelFooter } from "./ModelFooter";
import { GridHeader } from "partials";
import SplitPane from 'react-split-pane';

import { orientationAtom, payloadSelector } from "state";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const orientation = useRecoilValue(orientationAtom);
  const payload = useRecoilValue(payloadSelector);

  return (
    <>
      {rows?.length > 0 ? (
        <>
          {
            payload.sdt ? //check if sdt is present
              <SplitPane
                split={orientation === "horizontal" ? "horizontal" : "vertical"}
                allowResize={true} defaultSize={700}
                maxSize={orientation === "horizontal" ? 700 : null}
                minSize={orientation === "horizontal" ? null : 270}
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
              <div className={`flex flex-col grow ${orientation === "horizontal" ? 'max-h-full mr-[15.5rem]' : 'h-full ml-64'} overflow-scroll`}>
                <GridHeader />
                <Datagrid isDropped={isDropped} />
              </div>
          }
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
