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

export const ProjectSidebar = ({ project }) => {
	const location = useLocation()
	const { pathname } = location
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const trigger = useRef(null)
	const sidebar = useRef(null)

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
			if (!sidebarOpen || keyCode !== 27) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	})
	useEffect(() => {
		localStorage.setItem('project-sidebar-expanded', sidebarExpanded)
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('project-sidebar-expanded')
		} else {
			document.querySelector('body').classList.remove('project-sidebar-expanded')
		}
	}, [sidebarExpanded])
	return (
		<div className='w-56'>
			<div
				id='sidebar'
				ref={sidebar}
				className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-5/6 no-scrollbar w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 p-2 transition-all duration-200 ease-in-out ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-64'
				}`}>
				<ul className='m-1'>
					<SidebarLinkGroup activecondition={pathname.includes('ecommerce')}>
						{(handleClick, open) => {
							return (
								<React.Fragment>
									<a
										href='#0'
										className={`block text-gray-200 hover:text-white truncate transition duration-150 ${
											pathname.includes('ecommerce') && 'hover:text-gray-200'
										}`}
										onClick={(e) => {
											e.preventDefault()
											sidebarExpanded ? handleClick() : setSidebarExpanded(true)
										}}>
										<div className='flex items-center justify-between'>
											<div className='flex items-center'>
												{/* Icon */}
												<div className='flex flex-shrink-0 ml-2'>
													<svg
														className={`w-3 h-3 flex-shrink-0 ml-1 fill-current text-gray-400 ${
															open && 'transform rotate-180'
														}`}
														viewBox='0 0 12 12'>
														<path d='M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z' />
													</svg>
												</div>
												<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
													Files
												</span>
											</div>
										</div>
									</a>
									<div className='lg:hidden lg:project-sidebar-expanded:block 2xl:block'>
										<ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/customers'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Customers
													</span>
												</NavLink>
											</li>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/orders'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Orders
													</span>
												</NavLink>
											</li>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/invoices'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Invoices
													</span>
												</NavLink>
											</li>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/shop'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Shop
													</span>
												</NavLink>
											</li>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/shop-2'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Shop 2
													</span>
												</NavLink>
											</li>
											<li className='mb-1 last:mb-0'>
												<NavLink
													exact
													to='/ecommerce/product'
													className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'
													activeClassName='!text-indigo-500'>
													<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
														Single Product
													</span>
												</NavLink>
											</li>
										</ul>
									</div>
								</React.Fragment>
							)
						}}
					</SidebarLinkGroup>
				</ul>
				{/* Expand / collapse button */}
				<div className='pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto'>
					<div className='px-3 py-2'>
						<button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
							<span className='sr-only'>Expand / collapse sidebar</span>
							<svg
								className='w-6 h-6 fill-current project-sidebar-expanded:rotate-180'
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
		</div>
	)
}
export default ProjectSidebar
