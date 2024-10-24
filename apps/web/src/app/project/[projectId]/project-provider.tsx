'use client';
import React, {useEffect} from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {modelRunnerSelector, projectAtom, rightSidebarControlAtom, rowIdsAtom, templatesAtom} from 'state';
import init, {ModelRunner} from '../../../../public/pkg/glyphx_cube_model';
import {webTypes} from 'types';
const ProjectProvider = ({project, templates, children}) => {
  useEffect(() => {
    const initWasm = async () => {
      await init();
    };
    initWasm();
  }, []);

  return (
    <RecoilRoot
      initializeState={async ({set}) => {
        set(projectAtom, project);
        set(rowIdsAtom, false);
        set(templatesAtom, templates);
        set(modelRunnerSelector, new ModelRunner());
        set(rightSidebarControlAtom, {
          type: webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED,
          isSubmitting: false,
          data: project ?? {},
        });
      }}
    >
      <AuthProviders>{children}</AuthProviders>
    </RecoilRoot>
  );
};

export default ProjectProvider;
