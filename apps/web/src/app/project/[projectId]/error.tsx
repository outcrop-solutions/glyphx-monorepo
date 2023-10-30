'use client';
import React from 'react';
import {useRouter} from 'next/navigation';

import ProjectErrorIcon from 'public/svg/project-error-icon.svg';
import {Route} from 'next';

export default function ProjectErrorFallback() {
  const router = useRouter();

  function returnToHome() {
    router.push('/login' as Route);
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
    </div>
  );
}
