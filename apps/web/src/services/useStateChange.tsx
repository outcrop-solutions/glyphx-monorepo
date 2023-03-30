import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { stateQueryAtom } from "../state";

/**
 * Utility for applying a change in the current state to a given vizualization
 * @returns {void}
 * isStateChanged - {boolean}
 */

export const useStateChange = () => {
  const stateQuery = useRecoilValue(stateQueryAtom);
  useEffect(() => {
    if (stateQuery && window 
      //&& window.core
      ) {
      //window.core.ChangeState(JSON.stringify(stateQuery));
    }
  }, [stateQuery]);
};
