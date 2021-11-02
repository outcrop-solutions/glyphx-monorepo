import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
function Properties({
	properties,
	open,
	handleClick,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
}) {
	return (
		<React.Fragment>
			<a
				href='#0'
				className={`block text-gray-200 hover:text-white truncate border-gray-400 ${
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
							Properties
						</span>
					</div>
				</div>
			</a>
			<div
				className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 ${
					!open ? 'border-0 -my-2' : 'border-b border-gray-400'
				}`}>
				<ul className={`pl-2 mt-1 ${!open && 'hidden'}`}>
					<li className='mb-1 last:mb-0 flex'>
						<div className='flex items-center justify-center h-6 w-6'>
							<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z'
									fill='white'
								/>
								<path
									d='M7.056 7.104C7.15733 7.22133 7.208 7.344 7.208 7.472C7.208 7.62667 7.14667 7.76267 7.024 7.88C6.90667 7.992 6.77067 8.048 6.616 8.048C6.456 8.048 6.32 7.98133 6.208 7.848L4.704 6.008L3.184 7.848C3.06667 7.98133 2.93067 8.048 2.776 8.048C2.62667 8.048 2.49067 7.992 2.368 7.88C2.25067 7.76267 2.192 7.62667 2.192 7.472C2.192 7.33867 2.24 7.216 2.336 7.104L3.976 5.152L2.392 3.256C2.29067 3.13867 2.24 3.016 2.24 2.888C2.24 2.73333 2.29867 2.6 2.416 2.488C2.53867 2.37067 2.67467 2.312 2.824 2.312C2.984 2.312 3.12267 2.38133 3.24 2.52L4.704 4.288L6.152 2.52C6.26933 2.38133 6.408 2.312 6.568 2.312C6.71733 2.312 6.85067 2.37067 6.968 2.488C7.09067 2.6 7.152 2.73333 7.152 2.888C7.152 3.02133 7.104 3.144 7.008 3.256L5.424 5.152L7.056 7.104Z'
									fill='white'
								/>
							</svg>
						</div>
						<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
							<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
								{properties.x}
							</span>
						</div>
					</li>
					<li className='mb-1 last:mb-0 flex'>
						<div className='flex items-center justify-center h-6 w-6'>
							<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z'
									fill='white'
								/>
								<path
									d='M6.072 2.52C6.18933 2.38133 6.328 2.312 6.488 2.312C6.63733 2.312 6.77067 2.37067 6.888 2.488C7.01067 2.6 7.072 2.73067 7.072 2.88C7.072 3.01333 7.02133 3.13867 6.92 3.256L5.168 5.336V7.424C5.168 7.62667 5.10933 7.78133 4.992 7.888C4.87467 7.99467 4.728 8.048 4.552 8.048C4.36533 8.048 4.21333 7.99467 4.096 7.888C3.97867 7.78133 3.92 7.62667 3.92 7.424V5.336L2.184 3.256C2.08267 3.14933 2.032 3.024 2.032 2.88C2.032 2.73067 2.088 2.6 2.2 2.488C2.31733 2.37067 2.45067 2.312 2.6 2.312C2.76 2.312 2.89867 2.38133 3.016 2.52L4.544 4.384L6.072 2.52Z'
									fill='white'
								/>
							</svg>
						</div>
						<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
							<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
								{properties.y}
							</span>
						</div>
					</li>
					<li className='mb-1 last:mb-0 flex'>
						<div className='flex items-center justify-center h-6 w-6'>
							<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M8.99978 10.75C8.58557 10.75 8.24978 10.4142 8.24978 10V4.5C8.24978 4.08579 8.58557 3.75 8.99978 3.75C9.41399 3.75 9.74978 4.08579 9.74978 4.5V10C9.74978 10.4142 9.41399 10.75 8.99978 10.75Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M3.8413 13.371C3.6157 13.0236 3.71443 12.5591 4.06182 12.3335L8.67451 9.338C9.0219 9.1124 9.4864 9.21113 9.71199 9.55852C9.93759 9.90591 9.83886 10.3704 9.49147 10.596L4.87878 13.5915C4.53139 13.8171 4.0669 13.7184 3.8413 13.371Z'
									fill='white'
								/>
								<path
									fillRule='evenodd'
									clip-rule='evenodd'
									d='M14.3413 13.379C14.1157 13.7264 13.6512 13.8251 13.3038 13.5995L8.69113 10.604C8.34374 10.3784 8.24501 9.91392 8.47061 9.56653C8.6962 9.21914 9.1607 9.12041 9.50809 9.34601L14.1208 12.3415C14.4682 12.5671 14.5669 13.0316 14.3413 13.379Z'
									fill='white'
								/>
								<path
									d='M6.128 7.016C6.33067 7.016 6.48 7.056 6.576 7.136C6.672 7.216 6.72 7.33867 6.72 7.504C6.72 7.67467 6.672 7.8 6.576 7.88C6.48 7.96 6.33067 8 6.128 8H2.824C2.65867 8 2.52533 7.952 2.424 7.856C2.328 7.75467 2.28 7.62933 2.28 7.48C2.28 7.32533 2.33333 7.176 2.44 7.032L5.104 3.344H2.88C2.67733 3.344 2.528 3.304 2.432 3.224C2.336 3.144 2.288 3.02133 2.288 2.856C2.288 2.68533 2.336 2.56 2.432 2.48C2.528 2.4 2.67733 2.36 2.88 2.36H6.064C6.22933 2.36 6.36 2.41067 6.456 2.512C6.55733 2.608 6.608 2.73067 6.608 2.88C6.608 3.04 6.55733 3.18933 6.456 3.328L3.784 7.016H6.128Z'
									fill='white'
								/>
							</svg>
						</div>
						<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
							<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
								{properties.z}
							</span>
						</div>
					</li>
				</ul>
			</div>
		</React.Fragment>
	)
}

export default Properties
