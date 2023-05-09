import React from 'react';
import { fileIngestion as fileIngestionTypes, web as webTypes } from '@glyphx/types';

const Btn = ({ children, payload, idx, op, handleOp, className, ...rest }) => {
  const isActive = payload?.fileInfo[idx].operation === op;
  return (
    <button
      onClick={handleOp}
      className={`flex items-center ${
        isActive ? 'bg-primary-yellow' : 'bg-gray'
      } text-secondary-space-blue justify-around px-2 mx-2 py-1 rounded disabled:opacity-75 text-xs ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export const DecisionBtns = (
  ops: (fileIngestionTypes.constants.FILE_OPERATION | -1)[],
  idx: number,
  handleOp,
  payload: webTypes.IClientSidePayload
) => {
  return (
    <>
      {ops?.map((op) => (
        <>
          {(() => {
            switch (op) {
              case -1:
                return (
                  <Btn payload={payload} op={op} idx={idx} handleOp={() => handleOp(idx, op)} className="">
                    CANCEL
                  </Btn>
                );
              case 1:
                return (
                  <Btn payload={payload} op={op} idx={idx} handleOp={() => handleOp(idx, op)} className="">
                    APPEND
                  </Btn>
                );
              case 2:
                return (
                  <Btn payload={payload} op={op} idx={idx} handleOp={() => handleOp(idx, op)} className="">
                    ADD
                  </Btn>
                );
              case 3:
                return (
                  <Btn payload={payload} op={op} idx={idx} handleOp={() => handleOp(idx, op)} className="">
                    REPLACE
                  </Btn>
                );
              default:
                return <></>;
            }
          })()}
        </>
      ))}
    </>
  );
};
