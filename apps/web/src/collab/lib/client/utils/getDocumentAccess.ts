import {Document, DocumentAccess, User} from '../../../types';

interface Props {
  documentAccesses: Document['accesses'];
  projectIds: User['projectIds'];
  userId: User['id'];
}

const accessLevelHierarchy = [DocumentAccess.NONE, DocumentAccess.READONLY, DocumentAccess.EDIT, DocumentAccess.FULL];

export function getDocumentAccess({documentAccesses, userId, projectIds}: Props) {
  let accessLevel = documentAccesses.default;

  // If a project id  is higher than default access, use this
  projectIds.forEach((projectId) => {
    const groupAccess = documentAccesses.groups[projectId];
    if (accessLevelHierarchy.indexOf(groupAccess) > accessLevelHierarchy.indexOf(accessLevel)) {
      accessLevel = groupAccess;
    }
  });

  let userAccess = documentAccesses.users[userId];

  // If EDIT access set at user level, give FULL access
  if (userAccess === DocumentAccess.EDIT) {
    userAccess = DocumentAccess.FULL;
  }

  // If a user id is higher than default access, use this
  if (accessLevelHierarchy.indexOf(userAccess) > accessLevelHierarchy.indexOf(accessLevel)) {
    accessLevel = userAccess;
  }

  return accessLevel;
}
