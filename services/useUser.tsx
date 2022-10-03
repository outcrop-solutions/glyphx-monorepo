import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../state";

/**
 * Utility for interfacing with the User class in Cognito
 * @returns {void}
 * user - {Object}
 * setUser - {function}
 * isLogged - {boolean}
 */

export const useUser = () => {
  const router = useRouter();
  const setUser = useSetRecoilState(userAtom);
  /**
   * Check's if Qt has passed modelID to Front end
   */
  function checkParams() {
    var params = router.query;
    if (params.model !== null && params.model !== undefined) {
      router.push("/project/" + params.model);
    }
  }
  // check if user is logged in
  useEffect(() => {
    // console.log("in useEffect")
    // utility functions
    const getUser = async () => {
      const user = await Auth.currentAuthenticatedUser();
      if (!user) {
        console.log({ user, msg: "no USER" });
        router.push("/auth/signIn");
      } else {
        setUser(JSON.stringify(user));
        checkParams();
      }
    };
    getUser();
  }, [setUser]);
};
