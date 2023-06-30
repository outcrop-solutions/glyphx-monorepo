'use client';
import 'styles/globals.css';
import { useState } from 'react';
import Router from 'next/router';
import { SessionProvider } from 'next-auth/react';
import TopBarProgress from 'react-topbar-progress-indicator';
import { SWRConfig } from 'swr';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { RecoilRoot } from 'recoil';
import progressBarConfig from 'config/progress-bar';
import swrConfig from 'config/swr';
import { Toaster } from 'react-hot-toast';
import useToggleViewerOnRouteChange from 'services/useToggleViewerOnRouteChange';
import { Modals } from 'app/_components/Modals';
import { Loading } from 'app/_components/Loaders/Loading';

export const Providers = ({ children, session }: { children: React.ReactNode; session }) => {
  const [progress, setProgress] = useState(false);
  const swrOptions = swrConfig();

  Router.events.on('routeChangeStart', () => setProgress(true));
  Router.events.on('routeChangeComplete', () => setProgress(false));
  TopBarProgress.config(progressBarConfig());

  useToggleViewerOnRouteChange();

  return (
    <SessionProvider session={...session}>
      <SWRConfig value={swrOptions}>
        <RecoilRoot>
          <DndProvider backend={HTML5Backend}>
            <Toaster position="bottom-left" toastOptions={{ duration: 2000 }} />
            {progress && <TopBarProgress />}
            <Modals />
            <Loading />
            {children}
          </DndProvider>
        </RecoilRoot>
      </SWRConfig>
    </SessionProvider>
  );
};
