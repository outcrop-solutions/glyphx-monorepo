import React from 'react';
import { useRecoilValue } from 'recoil';
import { modalsAtom } from 'state';
import { Modal } from './Modal';

export const Modals = () => {
  const modals = useRecoilValue(modalsAtom);

  return (
    <>{modals.length > 0 ? modals.map((modalContent, idx) => <Modal modalContent={modalContent} idx={idx} />) : null}</>
  );
};
