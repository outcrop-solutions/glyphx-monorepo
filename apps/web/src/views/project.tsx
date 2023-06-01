import React from 'react';
// Project View
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Partials
import { ProjectSidebar } from 'partials';
import { GridContainer } from 'partials/datagrid/GridContainer';

export default function Project() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-row w-full h-full">
        {/* Project sidebar */}
        <ProjectSidebar />
        {/* Grid View */}
        <GridContainer />
      </div>
    </DndProvider>
  );
}
