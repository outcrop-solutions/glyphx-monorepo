import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "react-router-dom";

// AWS & Analytics
import posthog from "posthog-js";

import awsconfig from "./aws-exports";

// styles
import { focusHandling } from "cruip-js-toolkit";
import "./css/style.scss";

// components
import { Projects } from "./pages/Projects";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./partials/settings";
import SignIn from "./pages/Signin";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import { useUser } from "./services/useUser";
import { useProjects } from "./services/useProjects";
import Amplify from "aws-amplify";

// TODO: set api key in environment variable
posthog.init("phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS", {
  api_host: "https://app.posthog.com",
});

Amplify.configure(awsconfig);

function App() {
  // const [user, setUser] = useState({})
  const [signup, setSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, isLogged } = useUser(isLoggedIn);
  const [resetPass, setResetPass] = useState(false);
  const location = useLocation();
  const { projects, setProjects } = useProjects(isLoggedIn, user);
  // handle scroll position on route change
  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
    focusHandling("outline");
  }, [location.pathname]);

  useEffect(() => {
    setIsLoggedIn(isLogged);
  }, [isLogged]);

  return (
    <>
      <Switch>
        <Route exact path="/">
          {isLoggedIn && user ? (
            <Projects
              user={user}
              setIsLoggedIn={setIsLoggedIn}
              projects={projects}
              setProjects={setProjects}
            />
          ) : resetPass ? (
            <ResetPassword setResetPass={setResetPass} setSignUp={setSignUp} />
          ) : signup ? (
            <Signup setSignUp={setSignUp} setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <SignIn
              setResetPass={setResetPass}
              setSignUp={setSignUp}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
        </Route>
        <Route exact path="/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/settings">
          <Settings />
        </Route>
      </Switch>
    </>
  );
}

export default App;
