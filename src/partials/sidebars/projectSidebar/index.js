import React, { useState, useEffect, useRef } from 'react'
import ProjectLinkGroup from '../../ProjectLinkGroup'
import { NavLink, useLocation } from 'react-router-dom'
import { Tree } from '@minoru/react-dnd-treeview'
import ClickAwayListener from 'react-click-away-listener'
import { CustomNode } from '../CustomNode'
import { CustomDragPreview } from '../CustomDragPreview'
import styles from '../css/Sidebar.module.css'
import Filters from './filters'
import Properties from './properties'
import States from './states'
import ExpandCollapse from './ExpandCollapse'

export const ProjectSidebar = ({
	project,
	properties,
	columns,
	fileSystem,
	setFileSystem,
	states,
	state,
	setState,
	filters,
	setFilters,
	filtersApplied,
	setFiltersApplied,
}) => {
	const location = useLocation()
	const { pathname } = location
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [showCols, setShowCols] = useState(false)
	const trigger = useRef(null)
	const sidebar = useRef(null)

	const storedSidebarExpanded = localStorage.getItem('project-sidebar-expanded')
	const [sidebarExpanded, setSidebarExpanded] = useState(
		storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	)
	const handleStateChange = (state) => {
		setState((prev) => {
			let data = state
			return data
		})
	}
	const handleClickAway = () => {
		setShowCols(false)
	}
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
	}) // close on click outside
	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!sidebarOpen || keyCode !== 219) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	}) // close if the esc key is pressed
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

	const handleDrop = (newTree) => setFileSystem(newTree)
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
							<React.Fragment>
								<a
									href='#0'
									className={`block text-gray-200 hover:text-white truncate border-gray-400 ${
										Object.keys(fileSystem).length > 0
											? 'border-b border-gray-400'
											: 'border-b'
									} transition duration-150 ${
										pathname.includes('') && 'hover:text-gray-200'
									}`}
									onClick={(e) => {
										e.preventDefault()
										sidebarExpanded ? handleClick() : setSidebarExpanded(true)
									}}>
									<div
										className={`flex items-center h-11 ml-3 ${
											!sidebarExpanded ? 'w-full justify-center ml-0' : ''
										}`}>
										{/* Icon */}
										<div className='flex flex-shrink-0'>
											<svg
												aria-hidden='true'
												role='img'
												width='16'
												height='16'
												preserveAspectRatio='xMidYMid meet'
												viewBox='0 0 256 256'>
												<path
													d='M213.657 66.343l-40-40A8 8 0 0 0 168 24H88a16.018 16.018 0 0 0-16 16v16H56a16.018 16.018 0 0 0-16 16v144a16.018 16.018 0 0 0 16 16h112a16.018 16.018 0 0 0 16-16v-16h16a16.018 16.018 0 0 0 16-16V72a8 8 0 0 0-2.343-5.657zM136 192H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm0-32H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm64 24h-16v-80a8 8 0 0 0-2.343-5.657l-40-40A8 8 0 0 0 136 56H88V40h76.687L200 75.314z'
													fill='white'
												/>
											</svg>
										</div>

										{sidebarExpanded ? (
											<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
												Files
											</span>
										) : null}
										{/* </div> */}
									</div>
								</a>
								<div
									className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 pl-3 ${
										!open ? 'border-0' : 'border-b border-gray-400'
									}`}>
									<Tree
										tree={fileSystem}
										rootId={0}
										render={(node, { depth, isOpen, onToggle }) => (
											<CustomNode
												node={node}
												depth={depth}
												isOpen={isOpen}
												onToggle={onToggle}
											/>
										)}
										dragPreviewRender={(monitorProps) => (
											<CustomDragPreview monitorProps={monitorProps} />
										)}
										onDrop={handleDrop}
										classes={{
											root: styles.treeRoot,
											draggingSource: styles.draggingSource,
											dropTarget: styles.dropTarget,
										}}
									/>
								</div>
							</React.Fragment>
						)
					}}
				</ProjectLinkGroup>
				{/* Properties */}
				<ProjectLinkGroup activecondition={pathname.includes('')}>
					{(handleClick, open) => {
						return (
							<Properties
								includes={pathname.includes}
								sidebarExpanded={sidebarExpanded}
								setSidebarExpanded={setSidebarExpanded}
								handleClick={handleClick}
								open={open}
								properties={properties}
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
									filters={filters}
									setFilters={setFilters}
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
								includes={pathname.includes}
								sidebarExpanded={sidebarExpanded}
								setSidebarExpanded={setSidebarExpanded}
								handleClick={handleClick}
								states={states}
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
