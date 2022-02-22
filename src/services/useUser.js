import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";

export const useUser = (isLoggedin) => {
  const [user, setUser] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  // check if user is logged in
  useEffect(() => {
    // utility functions
    const assessLoggedIn = () => {
      Auth.currentAuthenticatedUser()
        .then(() => {
          setIsLogged(true);
        })
        .catch(() => {
          setIsLogged(false);
          // history.push('/signin')
        });
    };
    const getUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        setUser(user);
        console.log({ user });
      } catch (error) {
        console.log(error);
        setIsLogged(false);
      }
    };
    getUser();
    assessLoggedIn();
  }, [isLoggedin]);
  return { user, setUser, isLogged };
};
