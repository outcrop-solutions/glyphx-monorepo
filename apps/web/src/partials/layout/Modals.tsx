import React from 'react';
import { useRecoilValue } from 'recoil';
import { modalsAtom } from 'state';
import { Modal } from './Modal';

export const Modals = () => {
  const modalAtom = useRecoilValue(modalsAtom);
  const { modals } = modalAtom;
  const filtered = modals.filter((mod) => mod.data);

  // only render first modal in array
  return <>{filtered.length > 0 ? <Modal modalContent={filtered[0]} /> : null}</>;
};
