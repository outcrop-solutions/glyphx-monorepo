import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { Storage } from 'aws-amplify'
import { API, graphqlOperation } from 'aws-amplify'
import { listStates } from '../graphql/queries'
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
	const [columns, setColumns] = useState([])
	const [state, setState] = useState(null)
	const [states, setStates] = useState([])
	const [showAddProject, setShowAddProject] = useState(false)

	const ref = useRef(null)
	const pos = usePosition(ref)

	useEffect(() => {
		setPosition(pos)
	}, [pos]) // passes resize observation back up to app level state
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
		const getFilesList = async () => {
			try {
				// let files = await Storage.list(`${filePath}/`)
				let files = await Storage.list('')
				let fileSystem = processStorageList(files)
				// setFileSystem({ ...fileSystem })
			} catch (error) {
				console.log({ error })
			}
		}
		const getSidebar = async () => {
			try {
				let sidebarData = await Storage.get('sidebar.json', {
					download: true,
				})
				// data.Body is a Blob
				sidebarData.Body.text().then((string) => {
					let { columns, properties } = JSON.parse(string)
					setProperties({ ...properties })
					setColumns([...columns])
				})
			} catch (error) {
				console.log({ error })
			}
		}
		signUrl()
		getFilesList()
		getSidebar()
	}, [project]) //pass presigned url

	useEffect(() => {
		fetchStates()
	}, []) //fetch states

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
					showAddProject={showAddProject}
					setShowAddProject={setShowAddProject}
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
								<ProjectSidebar
									fileSystem={fileSystem}
									setFileSystem={setFileSystem}
									project={project}
									properties={properties}
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
