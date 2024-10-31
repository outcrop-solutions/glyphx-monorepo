'use client';
import React, {useEffect, useState} from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {modelRunnerAtom, rightSidebarControlAtom, rowIdsAtom, templatesAtom} from 'state';
import {webTypes} from 'types';
import {Modals} from 'app/_components/Modals';
import {Loading} from 'app/_components/Loaders/Loading';
import ProjectInit from './projectSetter';
import init, {ModelRunner} from '../../../../public/pkg/glyphx_cube_model';

const ProjectProvider = ({project, templates, children}) => {
  const [isClient, setIsClient] = useState(false);
  const [isInited, setIsInited] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient && (
      <RecoilRoot
        initializeState={async ({set}) => {
          set(rowIdsAtom, false);
          set(templatesAtom, templates);
          await init();
          const mr = new ModelRunner();
          set(modelRunnerAtom, mr);
          setIsInited(true);
          set(rightSidebarControlAtom, {
            type: webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED,
            isSubmitting: false,
            data: project ?? {},
          });
        }}
      >
        <AuthProviders>
          <ProjectInit project={project}>
            <Modals />
            <Loading />
            {isInited && children}
          </ProjectInit>
        </AuthProviders>
      </RecoilRoot>
    )
  );
};

export default ProjectProvider;
