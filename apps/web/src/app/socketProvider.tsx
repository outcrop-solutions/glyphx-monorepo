'use client';
import React from 'react';
import {useSocket} from 'services';

export const SocketProvider = ({children}) => {
  useSocket();
  return <>{children}</>;
};
