import {_updateProjectState} from '../../mutations';
import api from '../api';

export const callUpdateProject = (project, mutate) => {
  api({
    ..._updateProjectState(project.id, project.state),
    onSuccess: () => {
      mutate(`/api/project/${project.id}`);
    },
  });
};
