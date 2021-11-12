import React, { useState } from 'react'

import Header from '../partials/header'
import TableView from '../partials/projects/TableView'
import { GridView } from '../partials/projects/GridView'
import { ProjectSidebar } from '../partials/sidebars/project'
import { CommentsSidebar } from '../partials/sidebars/comments'
import { MainSidebar } from '../partials/sidebars/main'
import { useUrl } from '../services/useUrl'
import { useStateChange } from '../services/useStateChange'
import { useFilterChange } from '../services/useFilterChange'
import { DataTable } from '../partials/datagrid/index'
// import { Horizontal } from '../partials/dnd/Pages'

export const Projects = ({
	user,
	setIsLoggedIn,
	projects,
	commentsPosition,
	setCommentsPosition,
	filterSidebarPosition,
	setFilterSidebarPosition,
}) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [grid, setGrid] = useState(false)
	const [state, setState] = useState(null)
	const [project, setProject] = useState(false)
	const [filtersApplied, setFiltersApplied] = useState([])
	const [showAddProject, setShowAddProject] = useState(false)

	const { isStateChanged } = useStateChange(state)
	const { isFilterChanged } = useFilterChange(filtersApplied)
	// pass signed url
	const { isUrlSigned } = useUrl(project)

	return (
		<div className='flex h-screen overflow-hidden bg-gray-900'>
			{/* Sidebar */}
			<MainSidebar
				setProject={setProject}
				user={user}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Content area */}
			<div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
				{/*  Site header */}
				<Header
					project={project}
					showAddProject={showAddProject}
					setShowAddProject={setShowAddProject}
					setIsLoggedIn={setIsLoggedIn}
					project={project}
					setProject={setProject}
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					grid={grid}
					setGrid={setGrid}
				/>

				<main className='h-full'>
					<div className='flex relative h-full'>
						{project ? (
							<>
								<ProjectSidebar
									project={project}
									filtersApplied={filtersApplied}
									setFiltersApplied={setFiltersApplied}
									setFilterSidebarPosition={setFilterSidebarPosition}
									setState={setState}
								/>
								<div className='w-full flex'>
									<div className='min-w-0 flex-auto'>
										{/* <Dnd /> */}
										{/* <Horizontal /> */}
										<DataTable />
									</div>
									<CommentsSidebar
										user={user}
										project={project}
										setCommentsPosition={setCommentsPosition}
									/>
								</div>
							</>
						) : (
							<div className='px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto'>
								{grid ? (
									<TableView
										user={user}
										projects={projects}
										setProject={setProject}
									/>
								) : (
									<GridView
										showAddProject={showAddProject}
										setShowAddProject={setShowAddProject}
										user={user}
										projects={projects}
										setProject={setProject}
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
