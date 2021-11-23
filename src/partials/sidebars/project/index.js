import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import Filters from './filters'
import Properties from './properties'
import States from './states'
import { Files } from './files'
import ExpandCollapse from './ExpandCollapse'
import { usePosition } from '../../../services/usePosition'
import { Dnd } from './dnd'

export const ProjectSidebar = ({
	project,
	filtersApplied,
	setFiltersApplied,
	setFilterSidebarPosition,
	setState,
	isEditing,
	setIsEditing,
	colHeaders,
	setColHeaders,
}) => {
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [showCols, setShowCols] = useState(false)

	const trigger = useRef(null)
	const sidebar = useRef(null)
	const projPosition = usePosition(sidebar)

	const storedSidebarExpanded = localStorage.getItem('project-sidebar-expanded')
	const commentsSidebarExpanded = localStorage.getItem(
		'comments-sidebar-expanded'
	)
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

	//utilities
	const handleStateChange = (state) => {
		setState((prev) => {
			let data = state
			return data
		})
	}
	// const handleClickAway = () => {
	// 	setShowCols(false)
	// }
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
					colHeaders={colHeaders}
					setColHeaders={setColHeaders}
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

	return (
		<div
			id='sidebar'
			ref={sidebar}
			className={`flex flex-col absolute z-30 left-0 top-0 lg:static border-r border-gray-400 lg:left-auto lg:top-auto lg:translate-x-0 transform  h-full no-scrollbar w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
				sidebarOpen ? 'translate-x-0' : '-translate-x-64'
			}`}>
			<div>
				{/* Files */}
				<Dnd items={items} />

				{/* <ClickAwayListener onClickAway={handleClickAway}> */}
				{/* </ClickAwayListener> */}
				{/* States */}
				{/* Expand / collapse button */}
			</div>
			<div className='sticky bottom-0'>
				<ExpandCollapse
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
				/>
			</div>
		</div>
	)
}
export default ProjectSidebar
