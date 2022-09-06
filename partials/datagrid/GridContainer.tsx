import { rowsSelector } from "@/state/files";
import React from "react";
import { useRecoilValue } from "recoil";
import { AddFiles } from "../files";
import { Datagrid } from "./DataGrid";
import { ModelFooter } from "./ModelFooter";

export const GridContainer = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  
  return (
    <>
      {rows?.length > 0 ? (
        <>
          <div className="flex flex-col grow max-h-full">
            <Datagrid isDropped={isDropped} />
            <ModelFooter />
          </div>
        </>
      ) : (
        <AddFiles />
      )}
    </>
  );
};
