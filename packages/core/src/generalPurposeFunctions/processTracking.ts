import {v4} from 'uuid';
export function getProcessId() {
  const dirtyId = v4();
  const cleanId = dirtyId.replaceAll('-', '');
  return cleanId;
}
