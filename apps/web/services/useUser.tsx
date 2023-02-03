// import { Auth } from "aws-amplify";
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
  const { orgId, model } = router.query;
  const setUser = useSetRecoilState(userAtom);
  /**
   * Check's if Qt has passed modelID to Front end
   */
  function checkParams() {
    if (model !== null && model !== undefined) {
      router.push(`/${orgId}/project/${model}`);
    }
  }
  // check if user is logged in
  useEffect(() => {
    // utility functions
    const getUser = async () => {
      // const user = await Auth.currentAuthenticatedUser();
      // console.log({user})
      // if (!user) {
      //   console.log({ user, msg: "no USER" });
      //   router.push("/auth/signIn");
      // } else {
      //   checkParams();
      // }
    };
    getUser();
  }, [setUser]);
};

/**
 * Returns if user logged in or not
 * @returns {boolean}
 */
export const isUserLogged = async () =>{
  // const user = await Auth.currentAuthenticatedUser();
      // console.log({user})
      // if (!user) {
      //   return false;
      // } else {
      //   return true;
      // }
}
