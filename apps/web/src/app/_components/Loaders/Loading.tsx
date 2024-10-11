'use client';
import {useRecoilValue} from 'recoil';
import {showLoadingAtom} from 'state';
import {databaseTypes} from 'types';
import LoadingBar from './LoadingBar';
// {
//  processId: string;
//  processName: string;
//  processStatus: constants.PROCESS_STATUS;
//  processStartTime: Date;
//  processEndTime?: Date;
//  processMessages: string[];
//  processError: Record<string, unknown>[];
//  processResult?: Record<string, unknown>;
//  processHeartbeat?: Date;
// } = showLoading

export const Loading = () => {
  const showLoading = useRecoilValue(showLoadingAtom);

  const loading =
    Object.keys(showLoading).length > 0
      ? showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.COMPLETED &&
        showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.HUNG &&
        showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.FAILED
      : false;

  return loading ? (
    <div className="fixed w-screen h-screen flex flex-col justify-center items-center bg-secondary-midnight z-[90]">
      <LoadingBar />
      {showLoading?.processId && <p className="text-white font-bold mt-5">{`Process ID: ${showLoading?.processId}`}</p>}
      {showLoading?.processName && <p className="text-white font-bold mt-5">{`${showLoading?.processName}`}</p>}
      {showLoading?.processStatus && (
        <p className="text-white font-bold mt-5">{`Status: ${showLoading?.processStatus}`}</p>
      )}
      {showLoading?.processStartTime && (
        <p className="text-white font-bold mt-5">{`Start Time: ${showLoading?.processStartTime}`}</p>
      )}
      {showLoading?.processEndTime && (
        <p className="text-white font-bold mt-5">{`End Time: ${showLoading?.processEndTime.toTimeString()}`}</p>
      )}
      {showLoading?.processMessages && (
        <p className="text-white font-bold mt-5">{`Messages: ${showLoading?.processMessages?.join(' ')}`}</p>
      )}
      {showLoading?.processResult && (
        <p className="text-white font-bold mt-5">{`Result: ${showLoading?.processResult}`}</p>
      )}
      {showLoading?.processHeartbeat && (
        <p className="text-white font-bold mt-5">{`Heartbeat: ${showLoading?.processHeartbeat}`}</p>
      )}
    </div>
  ) : null;
};
