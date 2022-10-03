import React, { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { useRouter } from "next/router";

export const ProjectErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {

  const router = useRouter();

  function returnToHome(){
    router.push("/");
  }

  // TODO: HOOK THIS UP TO CENTARY
  useEffect(() => {
    console.log("Project Error Boundry", { error }, { errorMessage: error.message });
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-secondary-midnight text-white space-y-5">
      <svg xmlns="http://www.w3.org/2000/svg" fill="#FFC500" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p>Oh no something went wrong :( </p>
      <button onClick={returnToHome} className="p-5 bg-secondary-dark-blue rounded border border-transparent hover:border-primary-yellow hover:scale-110">
        Press here to return home
      </button>
      {/* <h4 className="text-white text-center" onClick={resetErrorBoundary}>Ok</h4>
      <h2 className="text-white text-center">Project Error Boundary l</h2>
      <h3 className="text-white text-center">{error.message}</h3> */}
    </div>
  );
};
