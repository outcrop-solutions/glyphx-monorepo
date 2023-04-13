import React from 'react';
import XAxisIcon from 'public/svg/x-axis-icon.svg';
import YAxisIcon from 'public/svg/y-axis-icon.svg';
import ZAxisIcon from 'public/svg/z-axis-icon.svg';
import DefaultAxisIcon from 'public/svg/default-axis-icon.svg';

export const AxesIcons = ({ property }) => {
  const Icon = () => {
    switch (property) {
      case 'X':
        return (
          <div className="flex items-center justify-center h-4 w-4 group-filters-hover:text-white">
            <XAxisIcon />
          </div>
        );
      case 'Y':
        return (
          <div className="flex items-center justify-center h-4 w-4 group-filters-hover:text-white">
            <YAxisIcon />
          </div>
        );
      case 'Z':
        return (
          <div className="flex items-center justify-center h-4 w-4 group-filters-hover:text-white">
            <ZAxisIcon />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-4 w-4 group-filters-hover:text-white">
            <DefaultAxisIcon />
          </div>
        );
    }
  };

  return <Icon />;
};
