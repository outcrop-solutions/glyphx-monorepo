import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import ProjectLinkGroup from '../../ProjectLinkGroup'
import { useLocation } from 'react-router-dom'
import ClickAwayListener from 'react-click-away-listener'
import Filters from './filters'
import Properties from './properties'
import States from './states'
import { Files } from './files'
import ExpandCollapse from './ExpandCollapse'
import { usePosition } from '../../../services/usePosition'

export const ProjectSidebar = ({
	project,
	columns,
	setFilterSidebarPosition,
	state,
	setState,
	filtersApplied,
	setFiltersApplied,
}) => {
	const location = useLocation()
	const { pathname } = location
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
	const handleClickAway = () => {
		setShowCols(false)
	}

	return (
		<div
			id='sidebar'
			ref={sidebar}
			className={`flex flex-col absolute z-30 left-0 top-0 lg:static border-r border-gray-400 lg:left-auto lg:top-auto lg:translate-x-0 transform  h-full no-scrollbar w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
				sidebarOpen ? 'translate-x-0' : '-translate-x-64'
			}`}>
			<ul>
				{/* Files */}
				<ProjectLinkGroup activecondition={pathname.includes('')}>
					{(handleClick, open) => {
						return (
							<Files
								project={project}
								includes={pathname.includes}
								sidebarExpanded={sidebarExpanded}
								setSidebarExpanded={setSidebarExpanded}
								handleClick={handleClick}
								open={open}
							/>
						)
					}}
				</ProjectLinkGroup>
				{/* Properties */}
				<ProjectLinkGroup activecondition={pathname.includes('')}>
					{(handleClick, open) => {
						return (
							<Properties
								sidebarExpanded={sidebarExpanded}
								setSidebarExpanded={setSidebarExpanded}
								handleClick={handleClick}
								open={open}
								project={project}
							/>
						)
					}}
				</ProjectLinkGroup>
				{/* Filters */}
				<ProjectLinkGroup activecondition={pathname.includes('')}>
					{(handleClick, open) => {
						return (
							<ClickAwayListener onClickAway={handleClickAway}>
								<Filters
									filtersApplied={filtersApplied}
									setFiltersApplied={setFiltersApplied}
									showCols={showCols}
									setShowCols={setShowCols}
									includes={pathname.includes}
									columns={columns}
									open={open}
									sidebarExpanded={sidebarExpanded}
									setSidebarExpanded={setSidebarExpanded}
									handleClick={handleClick}
								/>
							</ClickAwayListener>
						)
					}}
				</ProjectLinkGroup>
				{/* States */}
				<ProjectLinkGroup activecondition={pathname.includes('')}>
					{(handleClick, open) => {
						return (
							<States
								open={open}
								sidebarExpanded={sidebarExpanded}
								setSidebarExpanded={setSidebarExpanded}
								handleClick={handleClick}
								handleStateChange={handleStateChange}
								state={state}
							/>
						)
					}}
				</ProjectLinkGroup>
			</ul>
			{/* Expand / collapse button */}
			<ExpandCollapse
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
			/>
		</div>
		// </div>
	)
}
export default ProjectSidebar
