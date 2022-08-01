import React, { useState, useCallback, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

// Components
import GridLoader from "react-spinners/GridLoader";
import { Header, MainSidebar, ProjectSidebar, CommentsSidebar } from "partials";

// Types
import type { WithChildren } from "types";
import { Project } from "API";
import { useUser } from "services";

interface ProjectData
  extends Pick<
    Project,
    | "id"
    | "name"
    | "description"
    | "filePath"
    | "expiry"
    | "properties"
    | "url"
    | "author"
    | "shared"
    | "files"
    | "states"
    | "filters"
    | "columns"
    | "createdAt"
    | "updatedAt"
  > {}

// Constants
const title = "Glyphx | The Data Studio";
const description = "Create 3D visualizations with Glyphx";
const logo = "/favicon.ico";

const LayoutApp = ({ children }) => {
  // ROUTING
  const router = useRouter();
  const isProject = router.pathname.includes("/project");
  const rootPage = !isProject;

  // HANDLE SCROLL
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback(() => {
    setScrolled(window.pageYOffset > 20);
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // HANDLE LAYOUT OPTIONS
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // AUTH
  const { user } = useUser(null);
  if (!user) return <GridLoader />;

  return (
    <>
      <Head>
        <title>{title} </title>
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" type="image/x-icon" href={logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={title} />
        <meta itemProp="description" content={description} />
        <meta itemProp="image" content={logo} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={logo} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rivents" />
        <meta name="twitter:creator" content="@rivents" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={logo} />
      </Head>
      <main role="main">
        <div className="flex flex-col fixed w-full h-full">
          <Header />
          <div className="relative flex w-full grow">
            <div
              style={{ maxWidth: width }}
              className={`mx-auto overflow-y-scroll w-full h-full max-h-screen ${
                !isPage
                  ? "md:pl-48"
                  : `${rightOpen ? "pr-72" : "pr-0"} ${
                      leftOpen ? "pl-48" : "pl-0"
                    }`
              }`}
            >
              {children}
            </div>
            {/* {isPage && <CommentsSidebar />} */}
          </div>
        </div>
      </main>
    </>
  );
};
