import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { FILE_RULES } from './fileRules';

/**
 * @note populates file error modal
 * @param payload
 * @param existingFiles
 * @param acceptedFiles
 * @returns
 */
export const checkPayload = (
  payload: webTypes.IClientSidePayload,
  existingFiles: fileIngestionTypes.IFileStats[]
): webTypes.RuleWithData<webTypes.IFileRule>[] | false => {
  const stats = FILE_RULES.map((rule: webTypes.IFileRule) => {
    const data = rule.condition(payload, existingFiles);
    return { ...rule, isSubmitting: false, data: data };
  });

  const filtered = stats.filter((stat) => stat.data);
  // don't show file decicion modals unless data present
  // data is truthy (i.e {}) for CRUD modals
  return filtered.length > 0 ? filtered : false;
};
