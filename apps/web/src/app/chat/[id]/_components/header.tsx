import * as React from 'react';
import Link from 'next/link';
import {cn} from 'lib/utils/cn';
import {clearChats} from 'lib/actions/chat';
import {Button, buttonVariants} from './ui/button';
import {Sidebar} from './sidebar';
import {SidebarList} from './sidebar-list';
import {IconGitHub, IconNextChat, IconSeparator, IconVercel} from './ui/icons';
import {SidebarFooter} from './sidebar-footer';
import {ThemeToggle} from './theme-toggle';
import {ClearHistory} from './clear-history';
import {UserMenu} from './user-menu';
import {getServerSession} from 'next-auth';

export async function Header() {
  const session = await getServerSession();
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        {session?.user ? (
          <Sidebar>
            <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
              {/* @ts-ignore */}
              <SidebarList userId={session?.user?.id} />
            </React.Suspense>
            <SidebarFooter>
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </Sidebar>
        ) : (
          <Link href="/" target="_blank" rel="nofollow">
            <IconNextChat className="w-6 h-6 mr-2" inverted />
            <IconNextChat className="hidden w-6 h-6 mr-2" />
          </Link>
        )}
        <div className="flex items-center">
          <IconSeparator className="w-6 h-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button variant="link" asChild className="-ml-2">
              <Link href="/sign-in?callbackUrl=/">Login</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({variant: 'outline'}))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <a href="https://github.com/vercel/nextjs-ai-chatbot/" target="_blank" className={cn(buttonVariants())}>
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Deploy to Vercel</span>
          <span className="sm:hidden">Deploy</span>
        </a>
      </div>
    </header>
  );
}
