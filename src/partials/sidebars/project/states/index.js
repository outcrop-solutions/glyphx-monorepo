import React, { useState } from "react";
import { Header } from "./Header";
import { useStates } from "../../../../services/useStates";
import { StateList } from "./StateList";

export const States = ({
  handleStateChange,
  sidebarExpanded,
  setSidebarExpanded,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  const { states, state } = useStates();
  return (
    <React.Fragment>
      <Header
        open={open}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
      />
      {states.length > 0 && (
        <StateList
          handleStateChange={handleStateChange}
          id={state.id}
          open={open}
          states={states}
        />
      )}
    </React.Fragment>
  );
};

export default States;
