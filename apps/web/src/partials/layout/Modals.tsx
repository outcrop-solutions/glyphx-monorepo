import React from 'react';
import { useRecoilValue } from 'recoil';
import { modalsAtom } from 'state';
import { Modal } from './Modal';

export const Modals = () => {
  const modals = useRecoilValue(modalsAtom);

  // only render first modal in array
  return <>{modals.modals.length > 0 ? <Modal modalContent={modals[0]} /> : null}</>;
};
