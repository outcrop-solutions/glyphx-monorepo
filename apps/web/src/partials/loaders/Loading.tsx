import BarLoader from 'react-spinners/BarLoader';
import { useRecoilValue } from 'recoil';
import { showLoadingAtom } from 'state';
import { database as databaseTypes } from '@glyphx/types';
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

  const loading = showLoading
    ? showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.COMPLETED &&
      showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.HUNG &&
      showLoading.processStatus !== databaseTypes.constants.PROCESS_STATUS.FAILED
    : false;

  return showLoading ? (
    <div className="fixed w-screen h-screen flex justify-center items-center bg-secondary-midnight z-60">
      <BarLoader loading={loading} width={400} color={'yellow'} />
      <p className="text-white font-bold mt-5">{`Process ID: ${showLoading?.processId}`}</p>
      <p className="text-white font-bold mt-5">{`Process Name: ${showLoading?.processName}`}</p>
      <p className="text-white font-bold mt-5">{`Status: ${showLoading?.processStatus}`}</p>
      <p className="text-white font-bold mt-5">{`Start Time: ${showLoading?.processStartTime}`}</p>
      <p className="text-white font-bold mt-5">{`End Time: ${showLoading?.processEndTime}`}</p>
      <p className="text-white font-bold mt-5">{`Messages: ${showLoading?.processMessages.join(' ')}`}</p>
      <p className="text-white font-bold mt-5">{`Result: ${showLoading?.processResult}`}</p>
      <p className="text-white font-bold mt-5">{`Heartbeat: ${showLoading?.processHeartbeat}`}</p>
    </div>
  ) : null;
};
