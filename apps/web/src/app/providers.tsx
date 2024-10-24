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
import progressBarConfig from '../config/progress-bar';
import swrConfig from '../config/swr';
import {Toaster} from 'react-hot-toast';
import {Session} from 'next-auth';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {TooltipProvider} from './chat/[id]/_components/ui/tooltip';
import {GrowthbookWrapper} from './_components/GrowthbookWrapper';

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

  return (
    <SessionProvider session={sesh}>
      {/* @ts-ignore */}
      <SWRConfig value={swrOptions}>
        <PostHogProvider client={posthog}>
          {/*
           * Growthbook requires user info for attributes, must remain inside the AuthProvider
           */}
          <GrowthbookWrapper>
            <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                {/* @ts-ignore */}
                <DndProvider backend={HTML5Backend}>
                  <Toaster position="bottom-left" toastOptions={{duration: 2000}} />
                  {progress && <TopBarProgress />}
                  {children}
                </DndProvider>
              </TooltipProvider>
            </NextThemesProvider>
          </GrowthbookWrapper>
        </PostHogProvider>
      </SWRConfig>
    </SessionProvider>
  );
};
