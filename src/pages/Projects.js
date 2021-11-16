import React, { useState, useEffect } from 'react'
import {
	Switch,
	Route,
	useLocation,
	useHistory,
	Router,
	Redirect,
} from 'react-router-dom'
import QWebChannel from 'qwebchannel'

import Header from '../partials/header'
import TableView from '../partials/projects/TableView'
import { GridView } from '../partials/projects/GridView'
import { ProjectSidebar } from '../partials/sidebars/project'
import { CommentsSidebar } from '../partials/sidebars/comments'
import { MainSidebar } from '../partials/sidebars/main'
import { useUrl } from '../services/useUrl'
import { useStateChange } from '../services/useStateChange'
import { useFilterChange } from '../services/useFilterChange'
import { DataGrid } from '../partials/datagrid'
import { Columns } from '../partials/datagrid/columns'
// import { DataTable } from '../partials/datasheet-temp/index'
let socket = null
// import { Horizontal } from '../partials/dnd/Pages'

export const Projects = ({ user, setIsLoggedIn, projects }) => {
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
	const location = useLocation()
	const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false)
	// comments and filter sidebar positions
	// position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
	//position state dynamically changes with transitions
	const [commentsPosition, setCommentsPosition] = useState({})
	const [filterSidebarPosition, setFilterSidebarPosition] = useState({})

	useEffect(() => {
		console.log({
			filterSidebar: filterSidebarPosition.values,
			commentsSidebar: commentsPosition.values,
		})
		if (sendDrawerPositionApp) {
			// console.log({
			// 	filterSidebar: filterSidebarPosition,
			// 	commentsSidebar: commentsPosition,
			// })
			window.core.SendDrawerPosition(
				JSON.stringify({
					filterSidebar: filterSidebarPosition.values,
					commentsSidebar: commentsPosition.values,
				})
			)
			setSendDrawerPositionApp(false)
		}
	}, [commentsPosition, filterSidebarPosition, sendDrawerPositionApp])

	useEffect(() => {
		var baseUrl = 'ws://localhost:12345'
		openSocket(baseUrl)
	}, [location.pathname])
	const openSocket = (baseUrl) => {
		if (!socket) {
			socket = new WebSocket(baseUrl)
		}
		socket.onclose = function () {
			console.error('web channel closed')
		}
		socket.onerror = function (error) {
			console.error('web channel error: ' + error)
		}
		socket.onopen = function () {
			console.log('WebSocket connected, setting up QWebChannel.')
			new QWebChannel.QWebChannel(socket, function (channel) {
				try {
					// make core object accessible globally
					window.core = channel.objects.core
					window.core.KeepAlive.connect(function (message) {
						//Issued every 30 seconds from Qt to prevent websocket timeout
						console.log(message)
					})
					window.core.GetDrawerPosition.connect(function (message) {
						setSendDrawerPositionApp(true)
					})

					//core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
					//core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
					//core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
					//core.ChangeState("Change State");		// Takes the Json information for the selected state
					//core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
				} catch (e) {
					console.error(e.message)
				}
			})
		}
	}

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
									<div className='min-w-0 flex-auto mx-2' />
									{/* <Dnd /> */}
									{/* <Columns />
										<DataGrid /> */}
									{/* </div> */}
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
