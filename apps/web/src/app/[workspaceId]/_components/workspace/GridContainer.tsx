'use client';
// Hooks
import {useRecoilValue} from 'recoil';
import {showProjectsGridViewAtom} from 'state';
import {GridView} from './GridView';
import {TableView} from './TableView';

export const GridContainer = ({projects}) => {
  const isGridView = useRecoilValue(showProjectsGridViewAtom);

  return <>{isGridView ? <GridView projects={projects} /> : <TableView projects={projects} />}</>;
};
