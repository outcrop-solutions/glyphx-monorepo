/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {emailTypes} from 'types';

export const AnnotationCreatedTemplate = ({
  stateName: stateName,
  stateImage,
  annotation,
}: emailTypes.iAnnotationCreatedData) => (
  <body className="bg-secondary-deep-blue h-screen w-screen flex flex-col justify-center items-center space-y-2">
    <div className="flex flex-col justify-center items-center w-60">
      <div className="text-white mb-2">A thread was created on your project state</div>
      <div className="rounded border border-white h-72 w-full flex flex-col items-center mb-2 space-y-2 p-2">
        <img width={240} height={169} src={stateImage} alt="Sample Project" />
        <div className="text-white mb-2">{stateName}</div>
        <div className="text-white mb-2">{annotation}</div>
        <a className="bg-yellow px-2 py-1 font-semibold w-full text-center" href="https://app.glyphx.co/login">
          View in Glyphx
        </a>
      </div>
    </div>
  </body>
);
