import { useRef, useEffect } from "react";
import ExpandCollapse from "./ExpandCollapse";
import { Files } from "./files";
import { Properties } from "./properties";
import { Filters } from "./filters";
import { States } from "./states";
import { usePosition } from "../../../services/usePosition";

export const ProjectSidebar = ({
  openFile,
  sdt,
  selectFile,
  selectedFile,
  setSelectedFile,
  setDataGrid,
  setDataGridLoading,
  sidebarExpanded,
  setSidebarExpanded,
  setFilterSidebarPosition,
  sidebarOpen,
  setSidebarOpen,
  project,
  isEditing,
  propertiesArr,
  setPropertiesArr,
  filtersApplied,
  setFiltersApplied,
  handleStateChange,
  handleDrop,
  fileSystem,
  setFiles,
  filesOpen,
  setFilesOpen,
  states,
  state,
  setState,
  deleteState,
  setStates,
  uploaded,
  setUploaded,
  toastRef,
}) => {
  //utilities
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);

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
  useEffect(() => {
    localStorage.setItem("project-sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("project-sidebar-expanded");
    } else {
      document
        .querySelector("body")
        .classList.remove("project-sidebar-expanded");
    }
  }, [sidebarExpanded]);
  // set projectsSidebar position on transition
  useEffect(() => {
    // console.log({ sidebarExpanded, projPosition, setFilterSidebarPosition });
    setFilterSidebarPosition((prev) => {
      // console.log({ sidebar: sidebar });
      if (sidebar.current !== null) {
        return {
          values: sidebar.current.getBoundingClientRect(),
        };
      }
    });
  }, [sidebarExpanded, projPosition, setFilterSidebarPosition]);
  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex flex-col bg-primary-dark-blue absolute z-30 left-0 top-0 lg:static border-r border-gray-400 lg:left-auto lg:top-auto lg:translate-x-0 transform  h-full scrollbar-none w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <div className="overflow-y-auto scrollbar-none">
        {/* Files */}

        <Files
          openFile={openFile}
          selectFile={selectFile}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setDataGridLoading={setDataGridLoading}
          uploaded={uploaded}
          setUploaded={setUploaded}
          fileSystem={fileSystem}
          setFiles={setFiles}
          filesOpen={filesOpen}
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
          // modelProps={modelProps}
          // setModelProps={setModelProps}
        />
        {/* properties={modelProps.propMap[key]} */}
        <Filters
          sdt={sdt}
          projectId={project.id}
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
export default ProjectSidebar;
