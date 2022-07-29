import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "react-router-dom";

// AWS & Analytics
import posthog from "posthog-js";
import awsconfig from "./aws-exports";

import "./css/index.css";

// components
import { Projects } from "./pages/Projects";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import SignIn from "./pages/Signin";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import { useUser } from "services/useUser";
import { useProjects } from "services/useProjects";
import Amplify from "aws-amplify";

// TODO: set api key in environment variable
posthog.init("phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS", {
  api_host: "https://app.posthog.com",
});

Amplify.configure(awsconfig);
// testing

function App() {
  // const [user, setUser] = useState({})
  const [signup, setSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, setUser, isLogged } = useUser(isLoggedIn);
  const [resetPass, setResetPass] = useState(false);
  const { projects, setProjects } = useProjects(isLoggedIn);

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
              setUser={setUser}
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
