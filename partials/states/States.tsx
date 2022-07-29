import React, { useState } from "react";
import { Header } from "./Header";
import { StateList } from "./StateList";

export const States = ({
  query,
  filtersApplied,
  setFiltersApplied,
  handleStateChange,
  sidebarExpanded,
  setSidebarExpanded,
  project,
  states,
  state,
  setState,
  deleteState,
  setStates,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <Header
        open={open}
        query={query}
        project={project}
        handleClick={handleClick}
        setStates={setStates}
        filtersApplied={filtersApplied}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        setFiltersApplied={setFiltersApplied}
      />
      {states && states.length > 0 && (
        <StateList
          states={states}
          setStates={setStates}
          open={open}
          setState={setState}
          deleteState={deleteState}
          state={state}
          states={states}
        />
      )}
    </React.Fragment>
  );
};

export default States;
