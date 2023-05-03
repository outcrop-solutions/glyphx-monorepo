import {IProject} from '../../../database';
import {IHydratedFile} from './iHydratedFile';

export interface IHydratedProject extends IProject {
  files: IHydratedFile[];
}
