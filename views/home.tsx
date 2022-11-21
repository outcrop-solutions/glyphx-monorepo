import React, { useEffect,useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import sortArray from "sort-array";

// Amplify
import { withSSRContext, graphqlOperation, Auth } from "aws-amplify";

import { listProjects } from "graphql/queries";
import { ListProjectsQuery } from "API";

// Layout
import { Header } from "partials";
import { MainSidebar } from "partials";
import { Info } from "@/partials/info";
import { PinnedProjects } from "partials";

// Project Overiew
import { Templates } from "partials";
import { TableView } from "partials";
import { GridView } from "partials";
import { AddProjectModal } from "partials";
import { ProjectDetails } from "partials";

// Hooks
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  isGridViewAtom,
  projectDetailsAtom,
  projectsAtom,
  showAddProjectAtom,
  userAtom,
} from "state";
import { useRouter } from "next/router";
import { useProjects, useUser,isUserLogged } from "../services";
import { SuspenseFallback } from "@/partials/fallback";

export default function Home() {
  const router = useRouter();
  // useUser(); //gets user
  useProjects(); //gets projects assigned to user


  const projects = useRecoilValue(projectsAtom);
  const isGridView = useRecoilValue(isGridViewAtom);
  const projectDetails = useRecoilValue(projectDetailsAtom);
  const showAddProject = useRecoilValue(showAddProjectAtom);

  const [isLoading,setLoading] = useState(true);

  useEffect(()=>{

    isUserLogged().then((result)=>{
      if(!result){
        router.push("/auth/signIn");
      }
      else{
        setLoading(false);
      }
    }).catch((error)=>{
      console.log({error});
      router.push("/auth/signIn");
    })
  },[])

  if(isLoading){
    return(
      <div className="flex flex-col h-screen w-screen">
        <SuspenseFallback/>
      </div>
      
    );
  }else{
    return(
      <div className="flex flex-row h-screen w-screen scrollbar-none bg-secondary-midnight">
        {showAddProject ? <AddProjectModal /> : null}
        <MainSidebar />
        <div className="relative flex flex-col w-full">
          <Header />
          <hr
            className="text-gray h-[1px] ml-4"
          />
          
          <div className="h-full overflow-y-scroll">
            <div className="flex grow relative h-full">
              <div className="w-full flex text-white">
                {projects && projects.length > 0 ? (
                  <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                    <PinnedProjects />
                    {isGridView ? <GridView /> : <TableView />}
                  </div>
                ) : (
                  <Templates />
                )}
              </div>
            </div>
          </div>
        </div>
        <div id="right-side-bars" className="">
              {projectDetails ? <ProjectDetails/> : <></>}
        </div>
      </div>
    );
    // return (
    //   <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
    //     {showAddProject ? <AddProjectModal /> : null}
  
    //     <MainSidebar />
  
    //     {projectDetails ? <ProjectDetails /> : null}
    //     <div className="relative flex flex-col flex-1 overflow-hidden bg-primary-dark-blue scrollbar-none">
    //       {/* Site header */}
    //       <Header />
    //       <div className="h-full overflow-y-scroll">
    //         <div className="flex grow relative h-full">
    //           <div className="w-full flex text-white">
    //             {/* {JSON.stringify(projects)} */}
    //             {/* @ts-ignore */}
    //             {projects && projects.length > 0 ? (
    //               <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
    //                 {isGridView ? <GridView /> : <TableView />}
    //               </div>
    //             ) : (
    //               <Templates />
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
  
}
