import React, {useState} from 'react';
import {SketchPicker} from 'react-color';
import {toSnakeCase} from './toSnakeCase';

export const Color = ({config, currentConfig, handleChange, field}) => {
  const [isCollapsed, setCollapsed] = useState(true);
  return (
    <div key={field} className="px-2">
      <div
        onClick={() => {
          setCollapsed(!isCollapsed);
        }}
        className="flex ml-2 items-center cursor-pointer"
      >
        <span className="">
          <svg
            className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill="#CECECE"
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
            {' '}
            {field}{' '}
          </span>
        </div>
      </div>
      {!isCollapsed && (
        <SketchPicker
          color={config[toSnakeCase(field)]}
          onChange={({rgb}) => handleChange(currentConfig, toSnakeCase(field), rgb)}
        />
      )}
    </div>
  );
};
