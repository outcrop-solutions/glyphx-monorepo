import React, { useState, useEffect, useRef } from 'react'
import SidebarLinkGroup from '../SidebarLinkGroup'
import { NavLink, useLocation } from 'react-router-dom'

import Image01 from '../../images/user-28-01.jpg'
import Image02 from '../../images/user-28-02.jpg'
import Image03 from '../../images/user-28-03.jpg'
import Image04 from '../../images/user-28-04.jpg'
import Image05 from '../../images/user-28-05.jpg'
import Image06 from '../../images/user-28-06.jpg'
import Image07 from '../../images/user-28-07.jpg'
import Image09 from '../../images/user-28-09.jpg'
import Image11 from '../../images/user-28-11.jpg'

export const CommentsSidebar = ({ project }) => {
	const location = useLocation()
	const { pathname } = location
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const trigger = useRef(null)
	const sidebar = useRef(null)

	const storedSidebarExpanded = localStorage.getItem('comments-sidebar-expanded')
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
			if (!sidebarOpen || keyCode !== 221) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	})
	useEffect(() => {
		localStorage.setItem('comments-sidebar-expanded', sidebarExpanded)
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('comments-sidebar-expanded')
		} else {
			document.querySelector('body').classList.remove('comments-sidebar-expanded')
		}
	}, [sidebarExpanded])
	return (
		// <div className=''>
			<div
				id='sidebar'
				ref={sidebar}
				className={`flex flex-col absolute z-40 right-0 top-0 lg:static lg:right-auto lg:top-auto lg:translate-x-0 transform h-full no-scrollbar w-64 lg:w-20 lg:comments-sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 p-2 transition-all duration-200 ease-in-out ${
					sidebarOpen ? 'translate-y-64' : 'translate-x-0'
				}`}>
				<ul className='m-1'>
					<li>Comments</li>
				</ul>
				{/* Expand / collapse button */}
				<div className='pt-3 hidden lg:inline-flex 2xl:hidden justify-center comments-sidebar-expanded:justify-start pb-2 mt-auto'>
					<div className='px-3 py-2'>
						<button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
							<span className='sr-only'>Expand / collapse sidebar</span>
							<svg
								className='w-6 h-6 fill-current rotate-180 comments-sidebar-expanded:rotate-0'
								viewBox='0 0 24 24'>
								<path
									className='text-gray-400'
									d='M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z'
								/>
								<path className='text-gray-600' d='M3 23H1V1h2z' />
							</svg>
						</button>
					</div>
				</div>
			</div>
		// </div>
	)
}
export default CommentsSidebar
