import React, {useEffect} from 'react';
import {projectAtom} from 'state';
import {useSetRecoilState} from 'recoil';
import produce from 'immer';
import {fileIngestionTypes, webTypes} from 'types';

const ProjectInit = ({project, children}) => {
  const setProject = useSetRecoilState(projectAtom);

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
    setProject(proj);
  }, [project, setProject]);

  return <>{children}</>;
};

export default ProjectInit;
