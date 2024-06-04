'use client';
import {useRecoilValue} from 'recoil';
import {windowSizeAtom} from 'state';
import {Chat} from 'app/chat/[id]/_components/chat';
import {useParams} from 'next/navigation';

export const AIThreadsSidebar = () => {
  //utilities

  const params = useParams();
  const {height} = useRecoilValue(windowSizeAtom);

  return (
    <div
      id="sidebar"
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-gray h-full scrollbar-none w-[250px] shrink-0`}
    >
      <div
        style={{
          height: `${height && height - 60}px`,
        }}
        className={`overflow-y-auto w-full scrollbar-none`}
      >
        <Chat id={params?.projectId as string} />
      </div>
    </div>
  );
};
