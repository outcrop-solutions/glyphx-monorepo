import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export function useRedirectAuth() {
  const { data: session } = useSession();

  const router = useRouter();

  // If auth.user is false that means we're not
  // logged in and should redirect.
  // if session exists and user belongs to org, redirect to their dashboard

  useEffect(() => {
    if (!session && typeof session != "undefined") {
      router.push(`/login`);
      // @ts-ignore
    } else if (session?.user?.orgId) {
      // @ts-ignore
      router.push(`/${session?.user?.orgId}/dashboard`);
    }
  }, [session, router]);

  return session;
}
