'use client';
import React from 'react';
import {GridContainer} from 'app/project/[projectId]/_components/Datagrid/GridContainer';
import {useRecoilValue} from 'recoil';
import {projectSegmentAtom} from 'state';
import {Model} from './_components/Model';
import {useFeatureIsOn} from '@growthbook/growthbook-react';

export default function Collab() {
  const segment = useRecoilValue(projectSegmentAtom);
  const isWebGPUEnabled = useFeatureIsOn('webgpu');

  return segment === 'CONFIG' && isWebGPUEnabled ? <Model /> : <GridContainer />;
}
