import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

/**
 * Hook to handle automatic re-routing given session info
 * If no session is found via next-auth, redirect to the login page, else redirect to dashboard
 * @returns {Session | void}
 */

export function useRedirectAuth(): Session | void {
  const { data: session } = useSession();

  const router = useRouter();

  // If auth.user is false that means we're not
  // logged in and should redirect.
  // if session exists and user belongs to org, redirect to their dashboard

  useEffect(() => {
    if (!session && typeof session != 'undefined') {
      router.push(`/login`);
      // @ts-ignore
    } else if (session?.user?.orgId) {
      // @ts-ignore
      router.push(`/${session?.user?.orgId}/dashboard`);
    }
  }, [session, router]);

  return session;
}
