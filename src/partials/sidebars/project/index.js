import ExpandCollapse from "./ExpandCollapse";
import { Files } from "./files";
import { Properties } from "./properties";
import { Filters } from "./filters";
import { States } from "./states";

export const ProjectSidebar = ({
  setDataGrid,
  sidebarExpanded,
  setSidebarExpanded,
  sidebar,
  sidebarOpen,
  project,
  isEditing,
  propertiesArr,
  filtersApplied,
  setFiltersApplied,
  handleStateChange,
  showCols,
  setShowCols,
  handleDrop,
  fileSystem,
  setFiles,
}) => {
  //utilities

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex flex-col bg-gray-900 absolute z-30 left-0 top-0 lg:static border-r border-gray-400 lg:left-auto lg:top-auto lg:translate-x-0 transform  h-full scrollbar-none w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <div>
        {/* Files */}

        <Files
          fileSystem={fileSystem}
          setFiles={setFiles}
          setDataGrid={setDataGrid}
          project={project}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
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
          handleDrop={handleDrop}
          propertiesArr={propertiesArr}
          filtersApplied={filtersApplied}
          setFiltersApplied={setFiltersApplied}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
        <States
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          handleStateChange={handleStateChange}
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
