'use client';
import {useState, useEffect} from 'react';
import Router from 'next/router';
import posthog from 'posthog-js';
import {PostHogProvider} from 'posthog-js/react';
import {usePathname, useSearchParams} from 'next/navigation';
import {SessionProvider} from 'next-auth/react';
import TopBarProgress from 'react-topbar-progress-indicator';
import {SWRConfig} from 'swr';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {RecoilRoot} from 'recoil';
import progressBarConfig from 'config/progress-bar';
import swrConfig from 'config/swr';
import {Toaster} from 'react-hot-toast';
import useToggleViewerOnRouteChange from 'services/useToggleViewerOnRouteChange';
import {Modals} from 'app/_components/Modals';
import {Loading} from 'app/_components/Loaders/Loading';
import {Session} from 'next-auth';
import {AuthProviders} from 'app/_components/AuthProviders';
import {SocketProvider} from './socketProvider';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export const Providers = ({children, session}: {children: React.ReactNode; session: Session | null}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Track pageviews
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  const [progress, setProgress] = useState(false);
  const swrOptions = swrConfig();

  Router.events.on('routeChangeStart', () => setProgress(true));
  Router.events.on('routeChangeComplete', () => setProgress(false));
  TopBarProgress.config(progressBarConfig());

  const sesh = {...session} as Session;

  useToggleViewerOnRouteChange();

  return (
    <SessionProvider session={sesh}>
      {/* @ts-ignore */}
      <SWRConfig value={swrOptions}>
        <RecoilRoot>
          <PostHogProvider client={posthog}>
            <SocketProvider>
              <AuthProviders>
                {/* @ts-ignore */}
                <DndProvider backend={HTML5Backend}>
                  <Toaster position="bottom-left" toastOptions={{duration: 2000}} />
                  {progress && <TopBarProgress />}
                  <Modals />
                  <Loading />
                  {children}
                </DndProvider>
              </AuthProviders>
            </SocketProvider>
          </PostHogProvider>
        </RecoilRoot>
      </SWRConfig>
    </SessionProvider>
  );
};
