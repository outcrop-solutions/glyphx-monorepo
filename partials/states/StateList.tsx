import React from "react";
import { State } from "./State";
export const StateList = ({
  open,
  states,
  setState,
  state,
  setStates,
  deleteState,
}) => {
  return (
    <div
      className={`lg:hidden lg:project-sidebar-expanded:block ${
        !open ? "border-0" : "border-b border-slate-400"
      }`}
    >
      <ul
        style={{
          height: "200px",
        }}
        className={`overflow-auto ${!open && "hidden"}`}
      >
        {states.map((item) => (
          <State
            item={item}
            state={state}
            deleteState={deleteState}
            setState={setState}
            states={states}
            setStates={setStates}
          />
        ))}
      </ul>
    </div>
  );
};
