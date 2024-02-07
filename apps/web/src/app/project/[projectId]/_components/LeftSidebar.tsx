'use client';
import Link from 'next/link';
import ThreadsIcon from 'public/svg/threads-link.svg';
import BrainIcon from 'public/svg/brain-icon.svg';
import DownloadIcon from 'public/svg/download-icon.svg';
import SmallLogo from 'public/svg/small-logo.svg';
import {ArrowLeftIcon, CubeIcon, EyeIcon, FolderIcon} from '@heroicons/react/outline';
import {useParams} from 'next/navigation';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, projectSegmentAtom} from 'state';
import {useFeatureIsOn} from '@growthbook/growthbook-react';

const LeftSidebar = () => {
  const params = useParams();
  const projectId = params?.projectId;
  const [segment, setSegment] = useRecoilState(projectSegmentAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  // check if feature is enabled from growthbook endpoint
  const isAIEnabled = useFeatureIsOn('ai');
  const isWebGPUEnabled = useFeatureIsOn('webgpu');

  return (
    <aside
      className={`sticky z-40 flex flex-col px-4 space-y-2 pb-4 border-r border-gray text-white bg-secondary-deep-blue md:h-screen`}
    >
      <div className="relative flex items-center justify-center py-3 text-center border-b border-b-gray">
        <Link href="/">
          <div
            onClick={() => {
              setDrawer(false);
              window?.core?.ToggleDrawer(false);
            }}
            className={`py-1 ${projectId ? 'justify-center' : ''}`}
          >
            <SmallLogo />
          </div>
        </Link>
      </div>
      <div
        className={
          'flex-col space-y-1 md:flex md:top-0 absolute top-12 bg-secondary-deep-blue right-0 left-0 h-screen hidden md:relative'
        }
      >
        <div className="flex flex-col items-center space-y-2">
          <div onClick={() => setSegment('FILES')} className={`p-2 rounded ${segment === 'FILES' && 'bg-nav'}`}>
            <FolderIcon className="h-5 w-5" />
          </div>
          <div onClick={() => setSegment('MODEL')} className={`p-2 rounded ${segment === 'MODEL' && 'bg-nav'}`}>
            <CubeIcon className="h-5 w-5" />
          </div>
          <div onClick={() => setSegment('COLLAB')} className={`p-2 rounded ${segment === 'COLLAB' && 'bg-nav'}`}>
            <ThreadsIcon />
          </div>
          {isAIEnabled && (
            <div onClick={() => setSegment('AI')} className={`p-2 rounded ${segment === 'AI' && 'bg-nav'}`}>
              <BrainIcon />
            </div>
          )}
          {isWebGPUEnabled && (
            <>
              <div
                onClick={() => {
                  window?.core?.ToggleDrawer(false);
                  setSegment('CONFIG');
                }}
                className={`p-2 rounded ${segment === 'CONFIG' && 'bg-nav'}`}
              >
                <EyeIcon className="h-5 w-5" />
              </div>
              {/* <div onClick={() => setSegment('DATA')} className={`p-2 rounded ${segment === 'DATA' && 'bg-nav'}`}>
                <DownloadIcon />
              </div> */}
            </>
          )}
        </div>
      </div>
      {/* <div
        onClick={() => setSegment('NONE')}
        className={`w-full flex items-center justify-center hover:bg-nav p-1 rounded ${segment === 'NONE' && 'bg-nav'}`}
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </div> */}
    </aside>
  );
};

export default LeftSidebar;
