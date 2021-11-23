import React, { useState, useEffect } from 'react'

import SearchModal from '../../components/ModalSearch'
import GridToggle from '../../components/GridToggle'
import Notifications from '../../components/DropdownNotifications'
import Help from '../../components/DropdownHelp'
import SearchForm from '../actions/SearchForm'
import { Auth } from 'aws-amplify'
import FilterButton from '../../components/DropdownFilter'
import DeleteModel from '../../components/DeleteModel'

function Header({
	setIsLoggedIn,
	sidebarOpen,
	setSidebarOpen,
	grid,
	setProject,
	setGrid,
	project,
	setShowAddProject,
	setShare,
}) {
	const [searchModalOpen, setSearchModalOpen] = useState(false)
	const signOut = async () => {
		try {
			await Auth.signOut()
			setIsLoggedIn(false)
		} catch (error) {
			console.log('error sigingin out' + error)
		}
	}

	useEffect(() => {
		console.log({ project })
	}, [project])
	return (
		<header
			className={`sticky top-0 border-b border-gray-400 z-30 flex justify-between items-center bg-gray-900 max-h-16 ${
				project ? 'ml-0' : 'mx-6'
			}`}>
			<div
				className={`text-left hidden lg:block text-white font-extralight text-2xl mr-6 truncate ${
					project ? 'ml-6' : 'ml-0'
				}`}>
				{project ? project.name : 'My Project'}
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
					{/* <SearchForm placeholder='Search GlyphX' /> */}
					{!project && (
						<form
							onClick={(e) => {
								e.stopPropagation()
								setSearchModalOpen(true)
							}}
							className='relative bg-gray-400 bg-opacity-5 rounded-md hover:border-gray-300 hover:text-gray-600 z-60'>
							<label htmlFor='action-search' className='sr-only'>
								Search
							</label>
							<input
								id='action-search'
								className='form-input pl-9 border-transparent w-96 bg-transparent'
								type='search'
								placeholder='Search Glyphx'
							/>
							<button
								className='absolute inset-0 right-auto group'
								type='submit'
								aria-label='Search'>
								<svg
									className='w-4 h-4 flex-shrink-0 fill-current text-white group-hover:text-gray-500 ml-3 mr-2'
									viewBox='0 0 16 16'
									xmlns='http://www.w3.org/2000/svg'>
									<path d='M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z' />
									<path d='M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z' />
								</svg>
							</button>
						</form>
					)}
					{/* Header: Right side */}
					<div className='flex items-center space-x-3 mr-6'>
						{!project && (
							<>
								<SearchModal
									id='search-modal'
									searchId='search'
									modalOpen={searchModalOpen}
									setModalOpen={setSearchModalOpen}
								/>

								<GridToggle
									align='right'
									grid={grid}
									setGrid={setGrid}
									setProject={setProject}
								/>
							</>
						)}
						<Help align='right' />
						{/*  Divider */}
						{!project && <hr className='w-px h-6 bg-gray-200 mx-3' />}
						{project && (
							<button
								className={`w-24 h-8 flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 rounded-full ml-3 ${
									searchModalOpen && 'bg-gray-200'
								}`}
								onClick={(e) => {
									setShowAddProject(project ? true : false)
									setShare(true)
								}}
								aria-controls='search-modal'>
								<b className='text-gray-800 text-xs'>Share</b>
							</button>
						)}
						{!project && (
							<button
								className={`w-24 h-8 flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 rounded-full ml-3 ${
									searchModalOpen && 'bg-gray-200'
								}`}
								onClick={(e) => {
									setShowAddProject(project ? true : false)
								}}
								aria-controls='search-modal'>
								<b className='text-gray-800 text-xs'>New Project</b>
							</button>
						)}
						{project && <DeleteModel align='right' />}
						<Notifications align='right' />
						{!project && (
							<button
								className='btn rounded-2xl bg-yellow-400 text-gray-800 text-xs font-bold hover:text-white py-1.5'
								onClick={signOut}>
								Sign Out
							</button>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
