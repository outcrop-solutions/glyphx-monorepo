/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {emailTypes} from 'types';

export const EmailVerificationTemplate = ({url}: emailTypes.iEmailVerificationData) => {
  return (
    <div className="mx-auto max-w-lg rounded-lg">
      <div className="text-center py-2.5 text-xl font-sans text-text">
        Sign in to <strong>Glyphx</strong>
      </div>
      <div className="text-center py-2.5">
        {/* Glyphx Full Logo */}
        <img alt="logo" src="https://app.glyphx.co/icon" className="h-40" />
      </div>
      <div className="text-center py-5">
        <div className="rounded-md bg-buttonBackground">
          <a
            href={url}
            target="_blank"
            className="text-lg font-sans text-buttonText no-underline rounded-md py-2.5 px-5 inline-block font-bold border border-buttonBorder"
          >
            Sign in to your Workspace
          </a>
        </div>
      </div>

      <div className="text-center py-0 text-base leading-6 font-sans text-text">
        If you did not request this email you can safely ignore it.
      </div>
    </div>
  );
};
