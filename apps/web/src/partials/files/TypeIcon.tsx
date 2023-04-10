import React from 'react';
import SvgFileIcon from 'public/svg/svg-file-icon.svg';
import PngFileIcon from 'public/svg/png-file-icon.svg';
import CsvFileIcon from 'public/svg/csv-file-icon.svg';
import SdtFileIcon from 'public/svg/sdt-file-icon.svg';
import TextFileIcon from 'public/svg/text-file-icon.svg';
import JsonFileIcon from 'public/svg/json-file-icon.svg';
import DefaultFileIcon from 'public/svg/file-icon.svg';

export const TypeIcon = (fileType) => {
  switch (fileType) {
    case 'png':
      return <PngFileIcon />;
    case 'svg':
      return <SvgFileIcon />;
    case 'csv':
      return <CsvFileIcon />;
    case 'sdt':
      return <SdtFileIcon />;
    case 'text':
      return <TextFileIcon />;
    case 'json':
      return <JsonFileIcon />;
    default:
      return <DefaultFileIcon />;
  }
};
