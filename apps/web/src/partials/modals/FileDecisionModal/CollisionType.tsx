import { web as webTypes } from '@glyphx/types';

export const CollisionType = ({ type }: { type: webTypes.constants.COLLISION_CASE }) => {
  switch (type) {
    case webTypes.constants.COLLISION_CASE.COLUMNS:
      return <>{'Columns'}</>;
    case webTypes.constants.COLLISION_CASE.FILE_NAME:
      return <>{'File'}</>;
    case webTypes.constants.COLLISION_CASE.FILE_NAME_COLUMNS:
      return <>{'File & Columns'}</>;
  }
};
