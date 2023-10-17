import React from 'react';
import {Table} from './Table';

export const TablesView = ({tables}) => {
  return (
    <ul>
      {tables.map((table) => (
        <Table table={table} />
      ))}
    </ul>
  );
};
