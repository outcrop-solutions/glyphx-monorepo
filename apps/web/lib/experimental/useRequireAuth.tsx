import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

/**
 * Hook to require authentication on a route
 * If no session is found via next-auth, redirect to the login page
 * @returns {Session | void}
 */

export function useRequireAuth(): Session | void {
  const { data: session } = useSession();

  const router = useRouter();

  // If auth.user is false that means we're not
  // logged in and should redirect.
  useEffect(() => {
    if (!session && typeof session != 'undefined') {
      router.push(`/login`);
    }
  }, [session, router]);

  return session;
}
