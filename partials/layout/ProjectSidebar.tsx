import { useRef, useEffect, useState } from "react";
import { ExpandCollapse } from "./ExpandCollapse";
import { Files, States, Properties, Filters } from "partials";
import { usePosition } from "services/usePosition";
import { useRouter } from "next/router";

export const ProjectSidebar = ({
  error,
  openFile,
  sdt,
  selectFile,
  selectedFile,
  setSelectedFile,
  setDataGrid,
  sidebarExpanded,
  setSidebarExpanded,
  setFilterSidebarPosition,
  sidebarOpen,
  setSidebarOpen,
  project,
  isEditing,
  propertiesArr,
  setPropertiesArr,
  handleStateChange,
  handleDrop,
  fileSystem,
  setFiles,
  setFilesOpen,
  states,
  state,
  setState,
  deleteState,
  setStates,
  toastRef,
}) => {
  const router = useRouter();
  const { id: projectId } = router.query;

  //utilities
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);
  const [query, setQuery] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState([]);

  useEffect(() => {
    if (project) {
      setSidebarExpanded(true);
    }
  }, [project, setSidebarExpanded]);
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });
  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 219) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });
  //handle sidebar state in localStorage
  // set projectsSidebar position on transition
  useEffect(() => {
    setFilterSidebarPosition((prev) => {
      if (sidebar.current !== null) {
        return {
          values: sidebar.current.getBoundingClientRect(),
        };
      }
    });
  }, [sidebarExpanded, projPosition]);
  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-primary-dark-blue absolute z-30 left-0 top-0 lg:static border-r border-slate-400 lg:left-auto lg:top-auto  h-full scrollbar-none w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 shrink-0`}
    >
      <div className="overflow-y-auto scrollbar-none">
        {/* Files */}

        <Files
          openFile={openFile}
          selectFile={selectFile}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          fileSystem={fileSystem}
          setFiles={setFiles}
          setFilesOpen={setFilesOpen}
          setDataGrid={setDataGrid}
          project={project}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          toastRef={toastRef}
        />
        <Properties
          handleDrop={handleDrop}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          project={project}
          isEditing={isEditing}
          propertiesArr={propertiesArr}
        />
        {error ? (
          <div className="btn bg-yellow-600 text-white my-4 w-full">
            {error}
          </div>
        ) : null}
        <Filters
          sdt={sdt}
          setQuery={setQuery}
          projectId={projectId}
          handleDrop={handleDrop}
          propertiesArr={propertiesArr}
          setPropertiesArr={setPropertiesArr}
          filtersApplied={filtersApplied}
          setFiltersApplied={setFiltersApplied}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
        <States
          filtersApplied={filtersApplied}
          setFiltersApplied={setFiltersApplied}
          query={query}
          project={project}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          handleStateChange={handleStateChange}
          state={state}
          states={states}
          deleteState={deleteState}
          setState={setState}
          setStates={setStates}
        />
      </div>
      <div className="sticky bottom-0">
        <ExpandCollapse
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
      </div>
    </div>
  );
};
