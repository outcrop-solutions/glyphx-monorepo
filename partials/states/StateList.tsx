import { statesSelector } from "@/state/states";
import React from "react";
import { useRecoilValue } from "recoil";
import { State } from "./State";

export const StateList = () => {
  const states = useRecoilValue(statesSelector);

  return (
    <div className="lg:project-sidebar-expanded:block border-b border-slate-400">
      <ul
        style={{
          height: "200px",
        }}
        className={`overflow-auto`}
      >
        {states.map((item) => (
          <State item={item} />
        ))}
      </ul>
    </div>
  );
};
