import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

import Header from '../partials/Header'
import ProjectCard from '../partials/projects/ProjectCard'
import TableView from '../partials/projects/TableView'
import { GridView } from '../partials/projects/GridView'
import { ProjectSidebar } from '../partials/sidebars/ProjectSidebar'
import { CommentsSidebar } from '../partials/sidebars/CommentsSidebar'
import { MainSidebar } from '../partials/sidebars/MainSidebar'

// import Image01 from '../images/user-28-01.jpg'
// import Image02 from '../images/user-28-02.jpg'
// import Image03 from '../images/user-28-03.jpg'
// import Image04 from '../images/user-28-04.jpg'
// import Image05 from '../images/user-28-05.jpg'
// import Image06 from '../images/user-28-06.jpg'
// import Image07 from '../images/user-28-07.jpg'
// import Image08 from '../images/user-28-08.jpg'
// import Image09 from '../images/user-28-09.jpg'
// import Image10 from '../images/user-28-10.jpg'
// import Image11 from '../images/user-28-11.jpg'
// import Image12 from '../images/user-28-12.jpg'

// added here for clarity
const usePosition = (target) => {
	const [entry, setEntry] = useState()

	useLayoutEffect(() => {
		if (target.current) setEntry(target.current.getBoundingClientRect())
	}, [target])

	// Where the magic happens
	useResizeObserver(target, (entry) => setEntry(entry))

	return entry
}

export const Projects = ({ user, projects, position, setPosition }) => {
	const [grid, setGrid] = useState(false)
	const [project, setProject] = useState(false)

	const ref = useRef(null)
	const pos = usePosition(ref)

	// passes resize observation back up to app level state
	useEffect(() => {
		setPosition(pos)
	}, [pos])

	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className='flex h-screen overflow-hidden bg-gray-900'>
			{/* Sidebar */}
			<MainSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			{/* Content area */}
			<div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
				{/*  Site header */}
				<Header
					project={project}
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					grid={grid}
					setGrid={setGrid}
				/>

				<main className='h-full'>
					<div className='flex relative h-full'>
						{project ? (
							<>
								<ProjectSidebar project={project} />
								<div className='w-full flex'>
									<div ref={ref} className='min-w-0 flex-auto'></div>
									<CommentsSidebar project={project} />
								</div>
							</>
						) : (
							<div className='px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto'>
								{grid ? (
									<TableView />
								) : (
									<GridView projects={projects} setProject={setProject} />
								)}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
