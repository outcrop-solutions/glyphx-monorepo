import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
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
import { Invite } from '../partials/invite'
import { DragDropContext } from 'react-beautiful-dnd'

import { Files } from '../partials/sidebars/project/files'
import Properties from '../partials/sidebars/project/properties'
import Filters from '../partials/sidebars/project/filters'
import States from '../partials/sidebars/project/states'
import { usePosition } from '../services/usePosition'
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
		if (sendDrawerPositionApp) {
			window.core.SendDrawerPosition(
				JSON.stringify({
					filterSidebar: filterSidebarPosition.values,
					commentsSidebar: commentsPosition.values,
				})
			)
			// setSendDrawerPositionApp(false)
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

	// projectSidebar state and utilities
	const [projectSidebarOpen, setProjectSidebarOpen] = useState(true)
	const [showCols, setShowCols] = useState(false)
	const trigger = useRef(null)
	const sidebar = useRef(null)
	const projPosition = usePosition(sidebar)
	const storedSidebarExpanded = localStorage.getItem('project-sidebar-expanded')
	const [sidebarExpanded, setSidebarExpanded] = useState(
		storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	)
	// close on click outside
	useEffect(() => {
		const clickHandler = ({ target }) => {
			if (!sidebar.current || !trigger.current) return
			if (
				!sidebarOpen ||
				sidebar.current.contains(target) ||
				trigger.current.contains(target)
			)
				return
			setSidebarOpen(false)
		}
		document.addEventListener('click', clickHandler)
		return () => document.removeEventListener('click', clickHandler)
	})
	// close if the esc key is pressed
	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!sidebarOpen || keyCode !== 219) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	})
	//handle sidebar state in localStorage
	useEffect(() => {
		localStorage.setItem('project-sidebar-expanded', sidebarExpanded)
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('project-sidebar-expanded')
		} else {
			document
				.querySelector('body')
				.classList.remove('project-sidebar-expanded')
		}
	}, [sidebarExpanded])
	// set projectsSidebar position on transition
	useEffect(() => {
		setFilterSidebarPosition((prev) => {
			if (sidebar.current !== null) {
				return {
					values: sidebar.current.getBoundingClientRect(),
				}
			}
		})
	}, [sidebarExpanded, projPosition])
	const handleStateChange = (state) => {
		setState((prev) => {
			let data = state
			return data
		})
	}

	// DND state
	const [isEditing, setIsEditing] = useState(false)
	const [share, setShare] = useState(false)
	const columnHeaders = 'columnHeaders'
	const X = 'X'
	const Y = 'Y'
	const Z = 'Z'
	let items = [
		{
			id: 'files',
			content: (
				<Files
					project={project}
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
				/>
			),
		},
		{
			id: 'properties',
			content: (
				<Properties
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
					project={project}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
					// modelProps={modelProps}
					// setModelProps={setModelProps}
				/>
			),
		},
		{
			id: 'filters',
			content: (
				<Filters
					filtersApplied={filtersApplied}
					setFiltersApplied={setFiltersApplied}
					showCols={showCols}
					setShowCols={setShowCols}
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
				/>
			),
		},
		{
			id: 'states',
			content: (
				<States
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
					handleStateChange={handleStateChange}
				/>
			),
		},
	]
	const WIDGETS = 'WIDGETS'
	const [modelProps, setModelProps] = useState({
		propMap: {
			[columnHeaders]: [
				{
					id: `item-1`,
					content: 'objectId',
					type: 'ID',
				},
				{
					id: `item-2`,
					content: 'firstName',
					type: 'String',
				},
				{
					id: `item-3`,
					content: 'lastName',
					type: 'String',
				},
				{
					id: `item-4`,
					content: 'settings',
					type: 'Object',
				},
				{
					id: `item-5`,
					content: 'collaborators',
					type: 'Array',
				},
			],
			[X]: [
				{
					id: `item-6`,
					content: 'objectId',
					type: 'ID',
				},
				{
					id: `item-7`,
					content: 'settings',
					type: 'Object',
				},
				{
					id: `item-8`,
					content: 'collaborators',
					type: 'Array',
				},
			],
			[Y]: [],
			[Z]: [],
			[WIDGETS]: items ? items : [],
		},
	})
	useEffect(() => {
		setModelProps((prev) => {
			return { propMap: { ...prev.propMap, [WIDGETS]: [...items] } }
		})
	}, [items])
	// Drag and drop utilities
	const reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list)
		const [removed] = result.splice(startIndex, 1)
		result.splice(endIndex, 0, removed)

		return result
	}
	const reorderPropMap = ({ propMap, source, destination }) => {
		const current = [...propMap[source.droppableId]]
		const next = [...propMap[destination.droppableId]]
		const target = current[source.index]

		// moving to same list
		if (source.droppableId === destination.droppableId) {
			const reordered = reorder(current, source.index, destination.index)
			const result = {
				...propMap,
				[source.droppableId]: reordered,
			}
			return {
				propMap: result,
			}
		}

		// moving to different list

		// remove from original
		current.splice(source.index, 1)
		// insert into next
		next.splice(destination.index, 0, target)

		const result = {
			...propMap,
			[source.droppableId]: current,
			[destination.droppableId]: next,
		}

		return {
			propMap: result,
		}
	}
	function onDragEnd(result) {
		const { source, destination } = result
		console.log({ source, destination })
		// dropped outside the list
		if (!destination) {
			return
		}
		setModelProps((prev) => {
			let newData = reorderPropMap({
				propMap: prev.propMap,
				source,
				destination,
			})
			return newData
		})
		setIsEditing(false)
	}
	const onDragStart = () => {
		setIsEditing(true)
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
					setProject={setProject}
					showAddProject={showAddProject}
					setShowAddProject={setShowAddProject}
					setIsLoggedIn={setIsLoggedIn}
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					grid={grid}
					setGrid={setGrid}
					setShare={setShare}
				/>

				<main className='h-full'>
					<div className='flex relative h-full'>
						{project ? (
							<>
								<DragDropContext
									onDragEnd={onDragEnd}
									onDragStart={onDragStart}>
									<ProjectSidebar
										sidebar={sidebar}
										sidebarOpen={sidebarOpen}
										sidebarExpanded={sidebarExpanded}
										setSidebarExpanded={setSidebarExpanded}
										modelProps={modelProps}
									/>
									<div className='w-full flex'>
										<div className='min-w-0 flex-auto mx-2 overflow-x-auto'>
											{share ? (
												<Invite setShare={setShare} />
											) : (
												<div className='overflow-x-auto flex-col'>
													{Object.keys(modelProps.propMap).map((key, index) => {
														if (key === 'columnHeaders') {
															return (
																<Columns
																	key={key}
																	listId={key}
																	listType='CARD'
																	properties={modelProps.propMap[key]}
																/>
															)
														}
													})}
													<DataGrid />
												</div>
											)}
										</div>
										<CommentsSidebar
											user={user}
											project={project}
											setCommentsPosition={setCommentsPosition}
										/>
									</div>
								</DragDropContext>
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
