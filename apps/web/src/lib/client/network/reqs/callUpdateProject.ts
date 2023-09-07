import {_updateProjectState} from '../../mutations';
import api from '../api';

export const callUpdateProject = (project, mutate) => {
  api({
    ..._updateProjectState(project._id, project.state),
    onSuccess: () => {
      mutate(`/api/project/${project._id}`);
    },
  });
};
