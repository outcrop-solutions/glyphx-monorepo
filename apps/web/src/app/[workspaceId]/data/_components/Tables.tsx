import React from 'react';
import {Table} from './Table';
import {Files} from './Files';

export const TablesView = ({tablesData}) => {
  return (
    <ul>
      {tablesData.map((table) => (
        <Table table={table}>
          <Files files={table.files} />
        </Table>
      ))}
    </ul>
  );
};
