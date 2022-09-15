import { statesSelector } from "@/state/states";
import React from "react";
import { useRecoilValue } from "recoil";
import { State } from "./State";

export const StateList = () => {
  const states = useRecoilValue(statesSelector);

  return (
    <div className="lg:block border-b border-gray">
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
