import { useRef, useEffect, useState } from "react";
// import { ExpandCollapse } from "./ExpandCollapse";
import { Files, States, Properties, Filters } from "partials";
import { usePosition } from "services/usePosition";
import { useRouter } from "next/router";

export const ProjectSidebar = ({
  error,
  openFile,
  setFilterSidebarPosition,
  handleDrop,
  toastRef,
}) => {
  const router = useRouter();
  const { id: projectId } = router.query;

  //utilities
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);

  // set projectsSidebar position on transition
  useEffect(() => {
    setFilterSidebarPosition((prev) => {
      if (sidebar.current !== null) {
        return {
          values: sidebar.current.getBoundingClientRect(),
        };
      }
    });
  }, [projPosition]);

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-primary-dark-blue absolute z-30 left-0 top-0 lg:static border-r border-slate-400 lg:left-auto lg:top-auto  h-full scrollbar-none w-64 shrink-0`}
    >
      <div className="overflow-y-auto scrollbar-none">
        {/* Files */}
        <Files openFile={openFile} toastRef={toastRef} />
        <Properties handleDrop={handleDrop} />
        {error ? (
          <div className="btn bg-yellow-600 text-white my-4 w-full">
            {error}
          </div>
        ) : null}
        <Filters projectId={projectId} handleDrop={handleDrop} />
        <States />
      </div>
    </div>
  );
};
