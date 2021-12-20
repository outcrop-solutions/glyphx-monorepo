import React, { useState } from "react";
import { Header } from "./Header";
import { useStates } from "../../../../services/useStates";
import { StateList } from "./StateList";

export const States = ({
  handleStateChange,
  sidebarExpanded,
  setSidebarExpanded,
  project,
  states,
  state,
  setState,
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
          open={open}
          setState={setState}
          state={state}
          states={states}
        />
      )}
    </React.Fragment>
  );
};

export default States;
