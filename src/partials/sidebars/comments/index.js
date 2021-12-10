import React, { useState, useEffect, useRef } from 'react'
import { usePosition } from '../../../services/usePosition'
import { Header } from './Header'
import { ExpandCollapse } from './ExpandCollapse'
import { CommentInput } from './CommentInput'
import { History } from './History'

export const CommentsSidebar = ({
	state,
	project,
	setCommentsPosition,
	user,
}) => {
	// get sidebar exapanded from local storage
	const storedSidebarExpanded = localStorage.getItem(
		'comments-sidebar-expanded'
	)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [sidebarExpanded, setSidebarExpanded] = useState(
		storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	)

	// refs for sidebar trigger and resize
	const trigger = useRef(null)
	const sidebar = useRef(null)
	const pos = usePosition(sidebar)

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
			if (!sidebarOpen || keyCode !== 221) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	})
	//handle sidebar local storage
	useEffect(() => {
		localStorage.setItem('comments-sidebar-expanded', sidebarExpanded)
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('comments-sidebar-expanded')
		} else {
			document
				.querySelector('body')
				.classList.remove('comments-sidebar-expanded')
		}
	}, [sidebarExpanded])
	//fetch commentsSidebar position on layout resize
	useEffect(() => {
		setCommentsPosition((prev) => {
			if (sidebar.current !== null) {
				return {
					values: sidebar.current.getBoundingClientRect(),
				}
			}
		})
	}, [sidebarExpanded, pos])

	return (
		<div
			id='sidebar'
			ref={sidebar}
			className={`hidden lg:flex flex-col absolute z-10 right-0 top-0 lg:static border-l border-gray-400 lg:right-auto lg:top-auto lg:translate-x-0 transform h-full scrollbar-none w-64 lg:w-20 lg:comments-sidebar-expanded:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
				sidebarOpen ? 'translate-y-64' : 'translate-x-0'
			}`}>
			<Header sidebarExpanded={sidebarExpanded} />
			<div className='m-2 hidden comments-sidebar-expanded:block overflow-y-scroll scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-thumb-rounded-full'>
				<History />
				<CommentInput user={user} state={state} />
			</div>

			{/* Expand / collapse button */}
			<div className='sticky bottom-0'>
				<ExpandCollapse
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
				/>
			</div>
		</div>
	)
}
export default CommentsSidebar
