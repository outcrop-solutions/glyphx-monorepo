import * as React from 'react';
import {emailTypes} from 'types';
import '../styles.css';

export const StateCreatedTemplate: React.FC<Readonly<emailTypes.iStateCreatedData>> = ({stateName}) => (
  <div>
    <h1>Welcome, {stateName}!</h1>
  </div>
);
