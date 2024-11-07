'use client';
import React, {useEffect, useState} from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {docAtom, modelRunnerAtom, projectAtom, rightSidebarControlAtom, rowIdsAtom, templatesAtom} from 'state';
import {fileIngestionTypes, webTypes} from 'types';
import {Modals} from 'app/_components/Modals';
import {Loading} from 'app/_components/Loaders/Loading';
import produce from 'immer';
import init, {ModelRunner} from '../../../../public/pkg/glyphx_cube_model';

const ProjectProvider = ({project, doc, templates, permissions, children}) => {
  const [isClient, setIsClient] = useState(false);
  const [isInited, setIsInited] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient &&
    project && (
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
          set(docAtom, doc);
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
        <AuthProviders permissions={permissions}>
          <Modals />
          <Loading />
          {isInited && children}
        </AuthProviders>
      </RecoilRoot>
    )
  );
};

export default ProjectProvider;
