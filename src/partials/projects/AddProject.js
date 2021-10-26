import React from 'react'

export const AddProject = ({ setShowAddProject }) => {
	return (
		<div
			onClick={() => setShowAddProject(true)}
			className='col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-lg border border-opacity-50 border-gray-200'>
			<div className='flex flex-col items-center justify-center h-60'>
				<svg
					className='mt-20 mb-4'
					width='30'
					height='30'
					viewBox='0 0 30 30'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M15 0C6.72 0 0 6.72 0 15C0 23.28 6.72 30 15 30C23.28 30 30 23.28 30 15C30 6.72 23.28 0 15 0ZM21 16.5H16.5V21C16.5 21.825 15.825 22.5 15 22.5C14.175 22.5 13.5 21.825 13.5 21V16.5H9C8.175 16.5 7.5 15.825 7.5 15C7.5 14.175 8.175 13.5 9 13.5H13.5V9C13.5 8.175 14.175 7.5 15 7.5C15.825 7.5 16.5 8.175 16.5 9V13.5H21C21.825 13.5 22.5 14.175 22.5 15C22.5 15.825 21.825 16.5 21 16.5Z'
						fill='#595E68'
					/>
				</svg>
				<div className='text-white'>New Project</div>
			</div>
		</div>
	)
}
