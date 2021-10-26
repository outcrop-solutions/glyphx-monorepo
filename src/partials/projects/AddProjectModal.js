import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { createProject } from '../../graphql/mutations'
import { API, graphqlOperation, Storage } from 'aws-amplify'

export const AddProjectModal = ({ onUpload }) => {
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
		}
		try {
			console.log({ createProjectInput })
			const result = await API.graphql(
				graphqlOperation(createProject, { input: createProjectInput })
			)
			console.log({ result })
			onUpload()
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

	const handleCancel = () => {}
	return (
		<div className='absolute w-full h-full flex justify-center items-center'>
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
							<div>
								<input
									type='file'
									accept='.json'
									onChange={(e) => setProjectFile(e.target.files[0])}
								/>
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
		</div>
	)
}
