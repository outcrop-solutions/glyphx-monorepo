import React, {useCallback, useState} from 'react';
import {ConfigName} from './ConfigName';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {configsAtom, currentConfigAtom} from 'state';
import {PlusCircleIcon, PlusIcon} from '@heroicons/react/outline';
import {api, _createConfig} from 'lib';

const DEFAULT_CONFIG = {
  name: 'Default Config',
  current: true,
  min_color: {r: 0, g: 0, b: 0, a: 0},
  max_color: {r: 0, g: 0, b: 0, a: 0},
  background_color: {r: 0, g: 0, b: 0, a: 0},
  x_axis_color: {r: 0, g: 0, b: 0, a: 0},
  y_axis_color: {r: 0, g: 0, b: 0, a: 0},
  z_axis_color: {r: 0, g: 0, b: 0, a: 0},
  grid_cylinder_radius: 0,
  grid_cylinder_length: 0,
  grid_cone_length: 0,
  grid_cone_radius: 0,
  glyph_offset: 0,
  z_height_ratio: 0,
  z_offset: 0,
  toggle_grid_lines: true,
  toggle_glyph_offset: true,
  toggle_z_offset: true,
};

export const ConfigList = () => {
  const configs = useRecoilValue(configsAtom);
  const setCurrentConfig = useSetRecoilState(currentConfigAtom);
  const [isCollapsed, setCollapsed] = useState(true);

  const addConfig = useCallback(async () => {
    await api({..._createConfig(DEFAULT_CONFIG)});
  }, []);

  return (
    <div className="group flex flex-col grow">
      <summary className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray z-10">
        <div
          onClick={() => {
            setCollapsed(!isCollapsed);
          }}
          className="flex ml-2 items-center"
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
              Config{' '}
            </span>
          </div>
        </div>
        <PlusIcon
          color="#CECECE"
          className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
          onClick={addConfig}
        />
      </summary>
      {!isCollapsed && configs?.length > 0 && (
        <ul role="list" className="mt-2 space-y-1 border-b border-gray">
          {configs.map((config, idx) => (
            <li onClick={() => setCurrentConfig(idx)} key={idx}>
              <ConfigName config={config} idx={idx} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
