import React from 'react';
import {Table} from './Table';

export const TablesView = ({tablesData}) => {
  return (
    <ul>
      {tablesData.map((table) => (
        <Table table={table} />
      ))}
    </ul>
  );
};
