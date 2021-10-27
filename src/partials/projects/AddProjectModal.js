import React, { useState } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import { v4 as uuid } from 'uuid'
import { createProject } from '../../graphql/mutations'
import { API, graphqlOperation, Storage } from 'aws-amplify'

export const AddProjectModal = ({ user, setShowAddProject, fetchProjects }) => {
	const [menu, setMenu] = useState(true)
	const [view, setView] = useState('')
	const [projectData, setProjectData] = useState({})
	const [projectFile, setProjectFile] = useState('')

	const handleSave = async () => {
		// upload project file
		const { name, description } = projectData
		// const { key } = await Storage.put(`${uuid()}.json`, projectFile, {
		// 	contentType: 'json',
		// })

		const createProjectInput = {
			id: uuid(),
			name,
			description,
			filePath: 'sample_projects',
			owner: user.username,
		}
		try {
			console.log({ createProjectInput })
			const result = await API.graphql(
				graphqlOperation(createProject, { input: createProjectInput })
			)
			console.log({ result })
			setShowAddProject(false)
			fetchProjects()
		} catch (error) {
			console.log({ error })
		}
	}

	const toggleMenu = (param) => {
		if (param === 'file') {
			setView(param)
			setMenu(false)
		}
		if (param === 'manual') {
			setView(param)
			setMenu(false)
		}
	}

	const handleClickAway = () => {
		setShowAddProject(false)
	}
	const handleCancel = () => {}
	return (
		<div className='absolute w-full h-full flex justify-center items-center'>
			<ClickAwayListener onClickAway={handleClickAway}>
				<div className='rounded-md p-8 min-w-80 bg-gray-800 border-gray-400 border z-60'>
					{menu ? (
						<div className='w-full flex justify-between space-x-4'>
							<div
								onClick={() => toggleMenu('file')}
								className='btn select-none cursor-pointer bg-yellow-600 rounded-md py-1 hover:bg-yellow-400 text-white'>
								Add from project file
							</div>
							<div
								onClick={() => toggleMenu('manual')}
								className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
								Add Manually
							</div>
						</div>
					) : null}

					{!menu ? (
						<>
							{view === 'file' ? (
								<div className='p-4 bg-gray-800 w-max rounded-lg -m-10'>
									<div className='file_upload p-5 relative w-80 border-4 border-dotted border-gray-300 rounded-lg'>
										<svg
											className='text-white w-24 mx-auto mb-4'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'>
											<path
												stroke-linecap='round'
												stroke-linejoin='round'
												stroke-width='2'
												d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
											/>
										</svg>
										<div className='input_field flex flex-col w-max mx-auto text-center'>
											<label className='mb-4'>
												<input
													className='text-sm cursor-pointer w-36 hidden'
													type='file'
													multiple
												/>
												<div className='bg-yellow-400 text-gray-800 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-yellow-600'>
													Select
												</div>
											</label>
											<div className='title text-white uppercase'>
												or drop files here
											</div>
										</div>
										<div
											onClick={() => setShowAddProject(false)}
											className='absolute -top-10 -right-10 bg-gray-700 p-4 cursor-pointer hover:bg-gray-100 py-2 text-white hover:text-gray-900 rounded-full'>
											X
										</div>
									</div>
								</div>
							) : (
								<>
									<h1 className='text-xl text-white font-bold mb-6'>
										Add a new project
									</h1>
									{/* Form */}
									<div
										onKeyPress={(ev) => {
											if (ev.key === 'Enter') {
												ev.preventDefault()
												handleSave()
											}
										}}>
										<div className='space-y-4'>
											<div>
												<label className='block text-sm font-medium mb-1 text-white'>
													Name
												</label>
												<input
													id='name'
													value={projectData.name}
													onChange={(e) =>
														setProjectData({
															...projectData,
															name: e.target.value,
														})
													}
													className='form-input w-full bg-gray-900 border-gray-400 text-white focus:border-0'
												/>
											</div>
											<div>
												<label className='block text-sm font-medium mb-1 text-white'>
													Description
												</label>
												<input
													value={projectData.description}
													onChange={(e) =>
														setProjectData({
															...projectData,
															description: e.target.value,
														})
													}
													id='description'
													className='form-input w-full bg-gray-900 border-gray-400 focus:border-opacity-0 focus:ring-transparent text-white'
												/>
											</div>
										</div>
										<label className='block text-sm font-medium my-3 text-white'>
											States
										</label>
										<div className='flex justify-start items-center mt-6'>
											<div className='mr-2'>
												<div className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
													Link to an existing State
												</div>
											</div>
											<div
												className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'
												to='/'>
												Create & link to a new State
											</div>
										</div>
										<label className='block text-sm font-medium my-3 text-white'>
											Filters
										</label>
										<div className='flex justify-start items-center mt-6'>
											<div className='mr-2'>
												<div className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'>
													Link to an existing Filter
												</div>
											</div>
											<div
												className='btn select-none cursor-pointer bg-gray-600 rounded-md py-1 hover:bg-yellow-600 text-white'
												to='/'>
												Create & link to a new Filter
											</div>
										</div>
										<div className='flex items-center justify-between mt-6'>
											<div className='mr-1'>
												<div
													onClick={() => setMenu(true)}
													className='text-sm underline hover:no-underline text-gray-400'>
													Cancel
												</div>
											</div>
											<div
												onClick={handleSave}
												className='btn bg-yellow-400 select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow-600 text-gray-900 ml-3'
												to='/'>
												Save
											</div>
										</div>
									</div>
								</>
							)}
						</>
					) : null}
				</div>
			</ClickAwayListener>
		</div>
	)
}
