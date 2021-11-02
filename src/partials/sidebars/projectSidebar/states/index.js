import React, { useState, useEffect } from 'react'
function States({
	handleStateChange,
	state,
	open,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	handleClick,
	states,
}) {
	return (
		<React.Fragment>
			<a
				href='#0'
				className={`block text-gray-200 hover:text-white truncate ${
					open ? '' : 'border-b border-gray-400'
				} transition duration-150`}
				onClick={(e) => {
					e.preventDefault()
					sidebarExpanded ? handleClick() : setSidebarExpanded(true)
				}}>
				<div className='flex items-center justify-between h-11'>
					<div className='flex items-center'>
						{/* Icon */}
						<div className='flex flex-shrink-0 ml-2'>
							<svg
								className={`w-3 h-3 flex-shrink-0 ml-1 fill-current transform text-gray-400 ${
									open ? 'rotate-0' : '-rotate-90'
								}`}
								viewBox='0 0 12 12'>
								<path d='M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z' />
							</svg>
						</div>
						<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
							States
						</span>
					</div>
				</div>
			</a>
			{states.length > 0 && (
				<div
					className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 ${
						!open ? 'border-0 -my-2' : 'border-b border-gray-400'
					}`}>
					<ul
						style={{ height: '200px' }}
						className={`pl-2 mt-1 overflow-auto ${!open && 'hidden'}`}>
						{states.map((item, idx) => (
							<li
								onClick={() => {
									handleStateChange(item)
								}}
								className='mb-1 last:mb-0 flex'>
								<div className='flex items-center justify-center h-6 w-6'>
									<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
										<path
											d='M13.5054 10.2221V5.77806C13.5069 5.50644 13.4362 5.23931 13.3006 5.00398C13.1649 4.76866 12.9692 4.57359 12.7334 4.43872L8.8601 2.20939C8.62503 2.07241 8.35783 2.00024 8.08577 2.00024C7.8137 2.00024 7.5465 2.07241 7.31143 2.20939L3.44076 4.43339C3.20525 4.57007 3.00979 4.76622 2.87395 5.00222C2.73811 5.23821 2.66666 5.50576 2.66677 5.77806V10.2221C2.66549 10.4939 2.73649 10.7611 2.87249 10.9965C3.0085 11.2318 3.20462 11.4268 3.44076 11.5614L7.31143 13.7914C7.5465 13.9284 7.8137 14.0005 8.08577 14.0005C8.35783 14.0005 8.62503 13.9284 8.8601 13.7914L12.7334 11.5614C12.9692 11.4265 13.1649 11.2315 13.3006 10.9961C13.4362 10.7608 13.5069 10.4937 13.5054 10.2221ZM7.3121 12.0027L4.21543 10.2221V6.63739L7.3121 8.44139V12.0027ZM8.0861 7.10006L5.0201 5.31339L8.08677 3.54806L11.1534 5.31339L8.0861 7.10006ZM11.9568 10.2201L8.8601 12.0027V8.44139L11.9568 6.63739V10.2201Z'
											fill='#595E68'
										/>
									</svg>
								</div>
								<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
									<span
										className={`text-sm ${
											typeof item.id !== 'undefined'
												? item.id === state.id
													? 'text-white'
													: ''
												: ''
										} font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200`}>
										{item.title}
									</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</React.Fragment>
	)
}

export default States
