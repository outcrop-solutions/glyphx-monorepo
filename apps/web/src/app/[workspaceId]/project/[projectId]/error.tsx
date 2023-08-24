import React, { useEffect } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useRouter } from 'next/router';

import ProjectErrorIcon from 'public/svg/project-error-icon.svg';

export const ProjectErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const router = useRouter();

  function returnToHome() {
    router.push('/');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-secondary-midnight text-white space-y-5">
      <ProjectErrorIcon />
      <p>Oh no something went wrong :( </p>
      <button
        onClick={returnToHome}
        className="p-5 bg-secondary-dark-blue rounded border border-transparent font-roboto hover:border-primary-yellow hover:scale-110"
      >
        Press here to return home
      </button>
      {/* <h4 className="text-white text-center" onClick={resetErrorBoundary}>Ok</h4>
      <h2 className="text-white text-center">Project Error Boundary l</h2>
      <h3 className="text-white text-center">{error.message}</h3> */}
    </div>
  );
};
