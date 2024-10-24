'use client';
import React, {useEffect, useState} from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {modelRunnerSelector, projectAtom, rightSidebarControlAtom, rowIdsAtom, templatesAtom} from 'state';
import init, {ModelRunner} from '../../../../public/pkg/glyphx_cube_model';
import {fileIngestionTypes, webTypes} from 'types';
import {Modals} from 'app/_components/Modals';
import {Loading} from 'app/_components/Loaders/Loading';
import produce from 'immer';

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
          // rectify mongo scalar array
          const proj = produce(project, (draft) => {
            //   open the first file
            draft.files = draft.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));
            Object.values(draft.state.properties).forEach((prop: webTypes.Property) => {
              if (
                prop.dataType &&
                prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING &&
                prop.filter &&
                (prop.filter as webTypes.IStringFilter)?.keywords &&
                (prop.filter as webTypes.IStringFilter)?.keywords?.length > 0
              ) {
                const {keywords} = prop.filter as unknown as webTypes.IStringFilter;
                if (keywords && keywords.length > 0) {
                  draft.state.properties[prop.axis] = {
                    ...draft.state.properties[prop.axis],
                    filter: {
                      keywords: [
                        ...keywords.map((word) => {
                          return Object.values(word).join('');
                        }),
                      ],
                    },
                  };
                }
              }
            });
          });
          set(projectAtom, proj);
          set(rowIdsAtom, false);
          set(templatesAtom, templates);
          await init();
          setIsInited(true);
          set(modelRunnerSelector, new ModelRunner());
          set(rightSidebarControlAtom, {
            type: webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED,
            isSubmitting: false,
            data: project ?? {},
          });
        }}
      >
        <AuthProviders>
          <Modals />
          <Loading />
          {isInited && <>{children}</>}
        </AuthProviders>
      </RecoilRoot>
    )
  );
};

export default ProjectProvider;
