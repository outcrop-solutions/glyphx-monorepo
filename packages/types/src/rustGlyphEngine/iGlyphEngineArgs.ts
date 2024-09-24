import {IFieldDefinition} from './iFieldDefinition';
export interface IGlyphEngineArgs {
  workspace_id: string;
  project_id: string;
  //Should be 'client' for non testing workloads
  output_file_prefix: string;
  data_table_name: string;
  model_hash: string;
  filter?: string;
  xAxis: IFieldDefinition;
  yAxis: IFieldDefinition;
  zAxis: IFieldDefinition;
}