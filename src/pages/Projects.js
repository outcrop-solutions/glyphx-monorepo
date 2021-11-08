import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Storage } from 'aws-amplify'
import { API, graphqlOperation } from 'aws-amplify'
import { listStates, listFilters } from '../graphql/queries'
import Header from '../partials/Header'
import ProjectCard from '../partials/projects/ProjectCard'
import TableView from '../partials/projects/TableView'
import { GridView } from '../partials/projects/GridView'
import { ProjectSidebar } from '../partials/sidebars/projectSidebar'
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
	sidePosition,
	setSidePosition,
	fetchProjects,
}) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [grid, setGrid] = useState(false)
	const [project, setProject] = useState(false)
	const [properties, setProperties] = useState({})
	const [fileSystem, setFileSystem] = useState([
		{
			id: 1,
			parent: 0,
			droppable: true,
			text: 'Sample_Project',
		},
		{
			id: 2,
			parent: 1,
			droppable: false,
			text: 'sidebar.json',
			data: {
				fileType: 'json',
				fileSize: '0.5MB',
			},
		},
		{
			id: 3,
			parent: 1,
			droppable: false,
			text: 'mcgee_sku_model.zip',
			data: {
				fileType: 'zip',
				fileSize: '0.5MB',
			},
		},
	])
	const [files, setFiles] = useState([])

	const [filtersApplied, setFiltersApplied] = useState([])
	const [filters, setFilters] = useState([])
	const [columns, setColumns] = useState([])
	const [state, setState] = useState(null)
	const [states, setStates] = useState([])
	const [showAddProject, setShowAddProject] = useState(false)

	const ref = useRef(null)
	// const pos = usePosition(ref)

	// useEffect(() => {
	// 	// console.log({ position: ref.current.getBoundingClientRect() })
	// 	setPosition((prev) => {
	// 		// console.log({ ref })
	// 		if (ref.current !== null) {
	// 			ref.current.getBoundingClientRect()
	// 		}
	// 	})
	// })
	const storedSidebarExpanded = localStorage.getItem('project-sidebar-expanded')
	const commentsSidebarExpanded = localStorage.getItem(
		'comments-sidebar-expanded'
	)
	// useEffect(() => {
	// 	setPosition((prev) => {
	// 		if (ref.current !== null) {
	// 			console.log({
	// 				oldValues: ref.current.getBoundingClientRect(),
	// 				newValues: pos,
	// 			})
	// 			return {
	// 				oldValues: ref.current.getBoundingClientRect(),
	// 				newValues: pos,
	// 			}
	// 			// return {
	// 			// 	width: ref.current.offsetWidth,
	// 			// 	height: ref.current.offsetHeight,
	// 			// }
	// 		}
	// 	})
	// }, [storedSidebarExpanded, commentsSidebarExpanded, pos])
	// useEffect(() => {
	// 	setPosition(pos)
	// }, [pos]) // passes resize observation back up to app level state
	useEffect(() => {
		const signUrl = async () => {
			try {
				// TODO: put unzipped file names in sidebar.json
				let signedUrl = await Storage.get('mcgee_sku_model.zip')
				if (project && window.core) {
					window.core.OpenProject(JSON.stringify(signedUrl))
				}
			} catch (error) {
				console.log({ error })
			}
		}
		// const getFilesList = async () => {
		// 	try {
		// 		// let files = await Storage.list(`${filePath}/`)
		// 		let files = await Storage.list('')
		// 		let fileSystem = processStorageList(files)
		// 		// setFileSystem({ ...fileSystem })
		// 	} catch (error) {
		// 		console.log({ error })
		// 	}
		// }
		const getSidebar = async () => {
			try {
				let sidebarData = await Storage.get('sidebar.json', {
					download: true,
				})
				// data.Body is a Blob
				sidebarData.Body.text().then((string) => {
					let { files, columns, properties } = JSON.parse(string)
					console.log({ js: JSON.parse(string) })
					console.log({ columns })
					setProperties({ ...properties })
					setColumns([...columns])
					setFileSystem((prev) => {
						let newData = files.map((item, idx) => ({
							id: idx + 2,
							parent: 1,
							droppable: false,
							text: item,
							data: {
								fileType: item.split('.')[1],
								fileSize: '0.5MB',
							},
						}))
						newData.unshift({
							id: 1,
							parent: 0,
							droppable: true,
							text: 'Sample_Project',
						})
						return newData
					})
				})
			} catch (error) {
				console.log({ error })
			}
		}
		signUrl()
		// getFilesList()
		getSidebar()
	}, [project]) //pass presigned url

	useEffect(() => {
		fetchStates()
	}, []) //fetch states
	useEffect(() => {
		fetchFilters()
	}, []) //fetch filters
	useEffect(() => {
		if (window && window.core && state) {
			//build array of query strings
			if (typeof state.filters !== 'undefined') {
				let filterStringArr = []

				for (let i = 0; i < state.filters.length; i++) {
					let filter = state.filters[i]
					let cols = filter.columns
					for (let j = 0; j < cols.length; j++) {
						let name = cols[j].name
						let min = cols[j].min
						let max = cols[j].max

						let queryStr = `${name || '-'} BETWEEN ${min || '-'} AND ${
							max || '-'
						}`
						filterStringArr.push(queryStr)
					}
				}
				let query =
					filterStringArr.length > 0
						? `SELECT * from 0bc27e1c-b48b-474e-844d-4ec1b0f94613 WHERE ${filterStringArr.join(
								'AND'
						  )}`
						: ''
				const changeStateInput = {
					camera: state.camera,
					filter: query,
				}
				console.log({ changeStateInput })
				window.core.ChangeState(JSON.stringify(changeStateInput))
			}
		}
	}, [state]) //build query string and call state change function
	useEffect(() => {
		if (filtersApplied.length > 0 && window && window.core) {
			let filterStringArr = []

			for (let i = 0; i < filtersApplied.length; i++) {
				let filter = filtersApplied[i]
				let cols = filter.columns
				for (let j = 0; j < cols.length; j++) {
					let name = cols[j].name
					let min = cols[j].min
					let max = cols[j].max

					let queryStr = `${name || '-'} BETWEEN ${min || '-'} AND ${
						max || '-'
					}`
					filterStringArr.push(queryStr)
				}
			}
			let query =
				filterStringArr.length > 0
					? `SELECT * from 0bc27e1c-b48b-474e-844d-4ec1b0f94613 WHERE ${filterStringArr.join(
							'AND'
					  )}`
					: ''

			const updateFilterInput = {
				filter: query,
			}
			console.log({ updateFilterInput })
			window.core.UpdateFilter(JSON.stringify(updateFilterInput))
		}
		console.log({ filtersApplied })
	}, [filtersApplied]) //build query and call filter change function

	useEffect(() => {
		console.log({ fileSystem })
	}, [fileSystem])
	function processStorageList(results) {
		const filesystem = {}

		const add = (source, target, item) => {
			const elements = source.split('/')
			const element = elements.shift()
			if (!element) return // blank
			target[element] = target[element] || { __data: item } // element;
			if (elements.length) {
				target[element] =
					typeof target[element] === 'object' ? target[element] : {}
				add(elements.join('/'), target[element], item)
			}
		}
		results.forEach((item) => add(item.key, filesystem, item))
		return filesystem
	}
	const fetchStates = async () => {
		try {
			const stateData = await API.graphql(graphqlOperation(listStates))
			const stateList = stateData.data.listStates.items

			console.log({ stateList })
			setState(stateList[0])
			setStates((prev) => {
				let newData = [...stateList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching states', error)
		}
	}
	const fetchFilters = async () => {
		try {
			const filterData = await API.graphql(graphqlOperation(listFilters))
			const filterList = filterData.data.listFilters.items

			console.log({ filterList })
			setFilters((prev) => {
				let newData = [...filterList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching filters', error)
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
					showAddProject={showAddProject}
					setShowAddProject={setShowAddProject}
					setLoggedIn={setLoggedIn}
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
									filtersApplied={filtersApplied}
									setFiltersApplied={setFiltersApplied}
									filters={filters}
									setFilters={setFilters}
									fileSystem={fileSystem}
									setFileSystem={setFileSystem}
									project={project}
									properties={properties}
									setSidePosition={setSidePosition}
									columns={columns}
									states={states}
									state={state}
									setState={setState}
								/>
								<div className='w-full flex'>
									<div ref={ref} className='min-w-0 flex-auto'></div>
									<CommentsSidebar
										user={user}
										project={project}
										setPosition={setPosition}
										state={state}
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
										fetchProjects={fetchProjects}
									/>
								) : (
									<GridView
										showAddProject={showAddProject}
										setShowAddProject={setShowAddProject}
										user={user}
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
