import React, { useState } from "react";
import { Header } from "./Header";
import { useStates } from "../../../../services/useStates";
import { StateList } from "./StateList";

export const States = ({
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
        filtersApplied={filtersApplied}
        setFiltersApplied={setFiltersApplied}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
        project={project}
        setStates={setStates}
      />
      {states && states.length > 0 && (
        <StateList
          // handleStateChange={handleStateChange}
          // id={state.id}
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
