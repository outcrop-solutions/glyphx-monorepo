import React, {useEffect} from 'react';
import {isInitedAtom, modelRunnerAtom, projectAtom} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import {fileIngestionTypes, webTypes} from 'types';
// import {ModelRunner} from '../../../../public/pkg/glyphx_cube_model';

const ProjectInit = ({project, children}) => {
  const setProject = useSetRecoilState(projectAtom);
  // const [modelRunner, setModelRunner] = useRecoilState(modelRunnerAtom);
  // const isInited = useRecoilValue(isInitedAtom);

  useEffect(() => {
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
    // refresh();
    setProject(proj);
    return () => {
      setProject(null);
    };
  }, [project, setProject]);

  // // // this is set when initializing recoil root, but we need to make sure if react gets out of sync with wasm
  // useEffect(() => {
  //   if (!modelRunner && isInited) {
  //     const mr = new ModelRunner();
  //     setModelRunner(mr);
  //   }
  // }, [modelRunner, isInited]);

  return <>{children}</>;
};

export default ProjectInit;
