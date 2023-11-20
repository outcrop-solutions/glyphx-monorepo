'use client';
import React from 'react';
import {GridContainer} from 'app/project/[projectId]/_components/Datagrid/GridContainer';
import {useRecoilValue} from 'recoil';
import {projectSegmentAtom} from 'state';
import {Model} from './_components/Model';
import {useEnv} from 'lib/client/hooks';

export default function Collab() {
  const segment = useRecoilValue(projectSegmentAtom);
  const {isProd} = useEnv();

  return segment === 'CONFIG' && !isProd ? <Model /> : <GridContainer />;
}
