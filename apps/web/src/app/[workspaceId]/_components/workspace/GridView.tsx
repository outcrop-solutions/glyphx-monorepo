'use client';
import React from 'react';
import {ProjectCard} from './ProjectCard';

export const GridView = ({projects}) => {
  return (
    <>
      <div className="sm:flex sm:justify-between sm:items-center mb-8 bg-primary-blue">
        <div className="mb-4 sm:mb-0">
          <p className="font-rubik font-light text-lg leading-[21px] tracking-[0.01em] text-white ">
            Recently Viewed Projects
          </p>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-12 gap-6 bg-primary-blue pb-20">
        {projects.map((project) => {
          return <ProjectCard key={project.id!} project={project} />;
        })}
      </div>
    </>
  );
};
