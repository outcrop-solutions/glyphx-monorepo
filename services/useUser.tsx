import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";

/**
 * Utility for interfacing with the User class in Cognito
 * @param {boolean} isLoggedIn
 * @returns {Object}
 * user - {Object}
 * setUser - {function}
 * isLogged - {boolean}
 */

export const useUser = (userData: any) => {
  const [user, setUser] = useState(null);
  // check if user is logged in
  useEffect(() => {
    // utility functions

    const getUser = async () => {
      try {
        let newUser = await Auth.currentAuthenticatedUser();
        setUser(newUser);
      } catch (error) {
        console.log(error);
      }
    };
    if (userData) {
      setUser(userData);
      console.log({ OG: userData });
    } else {
      getUser();
    }
  }, [userData]);
  return { user, setUser };
};
