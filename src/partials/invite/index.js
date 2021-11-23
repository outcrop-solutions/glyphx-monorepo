import React from 'react'
import LinkDropDown from './LinkDropDown'
import { MemberList } from './MemberList'
import PermissionsDropDown from './PermissionsDropDown'

export const Invite = () => {
	return (
		<div class='flex-none mt-20 justify-center h-screen items-center antialiased bg-gray-900'>
			<div class='flex flex-col w-96 max-w-2xl rounded-lg border border-gray-300 shadow-xl py-4 px-5 mx-auto'>
				<div class='flex flex-row justify-between mb-4'>
					<p class='font-semibold text-white'>Invite</p>
					<svg
						class='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							stroke-linecap='round'
							stroke-linejoin='round'
							stroke-width='2'
							d='M6 18L18 6M6 6l12 12'></path>
					</svg>
				</div>
				<div class='flex flex-col w-full'>
					<input
						type='text'
						name=''
						placeholder='Email, comma separated...'
						class='bg-gray-900 border border-gray-400 rounded shadow-sm h-12'
						id=''
					/>
					<div className='flex items-center pt-3 pb-1'>
						<svg
							className='mb-2 mr-2'
							width='16'
							height='16'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M6.1665 9.04163C4.9965 9.04163 2.6665 9.62663 2.6665 10.7916V11.6666H9.6665V10.7916C9.6665 9.62663 7.3365 9.04163 6.1665 9.04163ZM3.8365 10.6666C4.2565 10.3766 5.2715 10.0416 6.1665 10.0416C7.0615 10.0416 8.0765 10.3766 8.4965 10.6666H3.8365ZM6.1665 8.16663C7.1315 8.16663 7.9165 7.38163 7.9165 6.41663C7.9165 5.45163 7.1315 4.66663 6.1665 4.66663C5.2015 4.66663 4.4165 5.45163 4.4165 6.41663C4.4165 7.38163 5.2015 8.16663 6.1665 8.16663ZM6.1665 5.66663C6.5815 5.66663 6.9165 6.00163 6.9165 6.41663C6.9165 6.83163 6.5815 7.16663 6.1665 7.16663C5.7515 7.16663 5.4165 6.83163 5.4165 6.41663C5.4165 6.00163 5.7515 5.66663 6.1665 5.66663ZM9.6865 9.07163C10.2665 9.49163 10.6665 10.0516 10.6665 10.7916V11.6666H12.6665V10.7916C12.6665 9.78163 10.9165 9.20663 9.6865 9.07163ZM9.1665 8.16663C10.1315 8.16663 10.9165 7.38163 10.9165 6.41663C10.9165 5.45163 10.1315 4.66663 9.1665 4.66663C8.8965 4.66663 8.6465 4.73163 8.4165 4.84163C8.7315 5.28663 8.9165 5.83163 8.9165 6.41663C8.9165 7.00163 8.7315 7.54663 8.4165 7.99163C8.6465 8.10163 8.8965 8.16663 9.1665 8.16663Z'
								fill='#595E68'
							/>
						</svg>

						<p class='mb-2 text-gray-700 text-left text-xs'>
							Everyone at Robert Weed can access this file
						</p>
					</div>
					<div class='flex items-center justify-between pb-4'>
						<LinkDropDown />
						<PermissionsDropDown />
					</div>
					<hr />
					<MemberList />
				</div>
				<div class='flex flex-row items-center justify-between pt-3  border-t border-gray-200'>
					<div className='flex items-center'>
						<svg
							className='mr-2'
							width='16'
							height='16'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M8.36396 4.12118L6.6669 5.81823L7.51543 6.66675L9.21249 4.9697C9.91252 4.26967 11.058 4.26967 11.7581 4.9697C12.4581 5.66973 12.4581 6.81524 11.7581 7.51527L10.061 9.21232L10.9095 10.0608L12.6066 8.3638C13.7776 7.19283 13.7776 5.29214 12.6066 4.12118C11.4356 2.95021 9.53493 2.95021 8.36396 4.12118ZM9.21249 10.0608L7.51543 11.7579C6.8154 12.4579 5.66988 12.4579 4.96985 11.7579C4.26981 11.0579 4.26981 9.91235 4.96985 9.21232L6.6669 7.51527L5.81838 6.66675L4.12132 8.3638C2.95035 9.53476 2.95035 11.4355 4.12132 12.6064C5.29229 13.7774 7.19299 13.7774 8.36396 12.6064L10.061 10.9094L9.21249 10.0608ZM6.24264 9.63658L9.63675 6.24249L10.4853 7.09101L7.09117 10.4851L6.24264 9.63658Z'
								fill='#595E68'
							/>
						</svg>

						<p class='font-thin text-gray-600'>Copy Link</p>
					</div>
					<button class='px-4 py-2 text-gray-900 font-semibold bg-yellow-400 rounded-2xl'>
						Send Invite
					</button>
				</div>
			</div>
		</div>
	)
}
