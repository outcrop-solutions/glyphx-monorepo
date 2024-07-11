import React from 'react';
import SvgFileIcon from 'svg/svg-file-icon.svg';
import PngFileIcon from 'svg/png-file-icon.svg';
import CsvFileIcon from 'svg/csv-file-icon.svg';
import SdtFileIcon from 'svg/sdt-file-icon.svg';
import TextFileIcon from 'svg/text-file-icon.svg';
import JsonFileIcon from 'svg/json-file-icon.svg';
import DefaultFileIcon from 'svg/file-icon.svg';

export const FileTypeIcons = (fileType) => {
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
