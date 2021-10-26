import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Storage } from 'aws-amplify'

import Header from '../partials/Header'
import ProjectCard from '../partials/projects/ProjectCard'
import TableView from '../partials/projects/TableView'
import { GridView } from '../partials/projects/GridView'
import { ProjectSidebar } from '../partials/sidebars/ProjectSidebar'
import { CommentsSidebar } from '../partials/sidebars/CommentsSidebar'
import { MainSidebar } from '../partials/sidebars/MainSidebar'

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

export const Projects = ({
	setLoggedIn,
	user,
	projects,
	position,
	setPosition,
	fetchProjects,
}) => {
	const [grid, setGrid] = useState(false)
	const [project, setProject] = useState(false)
	const ref = useRef(null)
	const pos = usePosition(ref)

	// passes resize observation back up to app level state
	useEffect(() => {
		setPosition(pos)
	}, [pos])

	useEffect(() => {
		const signUrl = async () => {
			try {
				let list = await Storage.list('sample_project/') // for listing ALL files without prefix, pass '' instead

				// window.core.OpenProject('open')
			} catch (error) {
				console.log({ error })
			}
		}
		if (user.attributes) {
		}
	}, [user])

	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className='flex h-screen overflow-hidden bg-gray-900'>
			{/* Sidebar */}
			<MainSidebar
				user={user}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Content area */}
			<div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
				{/*  Site header */}
				<Header
					setLoggedIn={setLoggedIn}
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
									<CommentsSidebar
										project={project}
										setPosition={setPosition}
									/>
								</div>
							</>
						) : (
							<div className='px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto'>
								{grid ? (
									<TableView />
								) : (
									<GridView
										projects={projects}
										setProject={setProject}
										fetchProjects={fetchProjects}
									/>
								)}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
