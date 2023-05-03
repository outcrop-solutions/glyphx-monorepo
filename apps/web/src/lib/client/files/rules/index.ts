import { web as webTypes } from '@glyphx/types';

import { dusplicateColumnRule } from './duplicateColumnRule';
import { fileCollisionRule } from './fileCollisionRule';

// Immutable pre-upload file rules
export const FILE_RULES: webTypes.IFileRule[] = [dusplicateColumnRule, fileCollisionRule];
