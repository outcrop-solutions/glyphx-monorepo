import React, { useState } from 'react'

import SearchModal from '../components/ModalSearch'
import Notifications from '../components/DropdownNotifications'
import Help from '../components/DropdownHelp'
import SearchForm from './actions/SearchForm'
import { Auth } from 'aws-amplify'
// import { AmplifySignOut } from '@aws-amplify/ui-react'

function Header({
	setLoggedIn,
	sidebarOpen,
	setSidebarOpen,
	grid,
	setGrid,
	project,
}) {
	const [searchModalOpen, setSearchModalOpen] = useState(false)
	const signOut = async () => {
		try {
			await Auth.signOut()
			setLoggedIn(false)
		} catch (error) {
			console.log('error sigingin out' + error)
		}
	}
	return (
		<header
			className={`sticky top-0 border-b border-gray-400 z-30 flex justify-between items-center bg-gray-900 max-h-16 ${
				project ? 'ml-0 mr-6' : 'mx-6'
			}`}>
			<div
				className={`text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate ${
					project ? 'ml-6' : 'ml-0'
				}`}>
				{project ? project.title : 'My Project'}
			</div>
			<div className='px-4 sm:px-6 lg:px-0 lg:w-5/6'>
				<div className='flex items-center justify-between h-16 -mb-px'>
					{/* Header: Left side */}
					<div className='flex'>
						{/* TODO: fix resizing here */}
						{/* Hamburger button */}
						{/* <button
							className='text-gray-500 hover:text-gray-600 lg:hidden'
							aria-controls='sidebar'
							aria-expanded={sidebarOpen}
							onClick={() => setSidebarOpen(!sidebarOpen)}>
							<span className='sr-only'>Open sidebar</span>
							<svg
								className='w-6 h-6 fill-current'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'>
								<rect x='4' y='5' width='16' height='2' />
								<rect x='4' y='11' width='16' height='2' />
								<rect x='4' y='17' width='16' height='2' />
							</svg>
						</button> */}
					</div>

					{/* Search form */}
					<SearchForm placeholder='Search GlyphX' />
					{/* Header: Right side */}
					<div className='flex items-center space-x-3'>
						<SearchModal
							id='search-modal'
							searchId='search'
							modalOpen={searchModalOpen}
							setModalOpen={setSearchModalOpen}
						/>
						<Notifications align='right' grid={grid} setGrid={setGrid} />
						<Help align='right' />
						{/*  Divider */}
						<hr className='w-px h-6 bg-gray-200 mx-3' />
						<button
							className={`w-24 h-8 flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 rounded-full ml-3 ${
								searchModalOpen && 'bg-gray-200'
							}`}
							onClick={(e) => {
								e.stopPropagation()
								setSearchModalOpen(true)
							}}
							aria-controls='search-modal'>
							<b className='text-gray-800 text-xs'>New Project</b>
						</button>

						<svg
							width='13'
							height='16'
							viewBox='0 0 13 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M12.2063 12.1354L11.1479 11.0769V6.97436C11.1479 4.45538 9.80224 2.34667 7.45557 1.78872V1.23077C7.45557 0.549744 6.90583 0 6.2248 0C5.54378 0 4.99403 0.549744 4.99403 1.23077V1.78872C2.63916 2.34667 1.30172 4.44718 1.30172 6.97436V11.0769L0.243263 12.1354C-0.27366 12.6523 0.0873658 13.5385 0.817622 13.5385H11.6238C12.3622 13.5385 12.7233 12.6523 12.2063 12.1354ZM9.50685 11.8974H2.94275V6.97436C2.94275 4.93949 4.18173 3.28205 6.2248 3.28205C8.26788 3.28205 9.50685 4.93949 9.50685 6.97436V11.8974ZM6.2248 16C7.12737 16 7.86583 15.2615 7.86583 14.359H4.58378C4.58378 15.2615 5.31403 16 6.2248 16Z'
								fill='white'
							/>
						</svg>
						{/* <div className='w-4'> */}
						<button
							className='btn rounded-2xl bg-yellow-400 text-gray-800 text-xs font-bold hover:text-white py-1.5'
							onClick={signOut}>
							Sign Out
						</button>
						{/* <AmplifySignOut /> */}
						{/* </div> */}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
