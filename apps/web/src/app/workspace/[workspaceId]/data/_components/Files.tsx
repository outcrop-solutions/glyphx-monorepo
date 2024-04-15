import React from 'react';
import {File} from './File';

export const Files = ({files}) => {
  return (
    <ul>
      {files.map((file) => (
        <File file={file} />
      ))}
    </ul>
  );
};
