import {AiStreamSourceType} from './aiStreamSourceType';
import {
  ANTHROPIC_MODELS,
  OPENAI_MODELS,
  LANGCHAIN_MODELS,
  HF_MODELS,
} from './models';

export interface IAiProvider {
  source: AiStreamSourceType;
  model: ANTHROPIC_MODELS | OPENAI_MODELS | LANGCHAIN_MODELS | HF_MODELS;
}
