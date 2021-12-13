import { useState } from 'react'

import ClickAwayListener from 'react-click-away-listener'

function Column({ item }) {
	const [edit, setEdit] = useState(false)

	const [name, setName] = useState(item.name || '')
	const [min, setMin] = useState(item.min || '')
	const [max, setMax] = useState(item.max || '')

	const handleMin = (e) => {
		setMin(e.target.value)
	}
	const handleMax = (e) => {
		setMax(e.target.value)
	}
	const handleName = (e) => {
		setName(e.target.value)
	}
	const handleSaveName = () => {}
	const handleSaveMin = () => {}
	const handleSaveMax = () => {}

	const handleClickAway = () => {
		setEdit(false)
	}
	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<li className='mb-1 last:mb-0 flex'>
				<div className='flex items-center justify-center h-6 w-6'>
					{edit ? (
						<svg
							onClick={() => setEdit(false)}
							aria-hidden='true'
							role='img'
							width='16'
							height='16'
							preserveAspectRatio='xMidYMid meet'
							viewBox='0 0 16 16'>
							<g fill='white'>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M1.5 1h13l.5.5v13l-.5.5h-13l-.5-.5v-13l.5-.5zM2 2v12h12V2H2zm6 9a3 3 0 1 0 0-6a3 3 0 0 0 0 6z'
								/>
							</g>
						</svg>
					) : (
						<svg
							onClick={() => setEdit(true)}
							aria-hidden='true'
							role='img'
							width='16'
							height='16'
							preserveAspectRatio='xMidYMid meet'
							viewBox='0 0 24 24'>
							<g fill='none'>
								<path
									d='M4.42 20.579a1 1 0 0 1-.737-.326a.988.988 0 0 1-.263-.764l.245-2.694L14.983 5.481l3.537 3.536L7.205 20.33l-2.694.245a.95.95 0 0 1-.091.004zM19.226 8.31L15.69 4.774l2.121-2.121a1 1 0 0 1 1.415 0l2.121 2.121a1 1 0 0 1 0 1.415l-2.12 2.12l-.001.001z'
									fill='white'
								/>
							</g>
						</svg>
					)}
				</div>
				<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
					{edit ? (
						<div className='flex mx-2'>
							<input
								onKeyPress={(ev) => {
									if (ev.key === 'Enter') {
										ev.preventDefault()
										setEdit(false)
										handleSaveName()
									}
								}}
								className='mb-2 w-10/12 border border-white rounded-md pl-2 text-white mx-2 bg-transparent placeholder-gray-400 text-sm font-medium appearance-none'
								onChange={handleName}
								value={name}
							/>
							<svg
								aria-hidden='true'
								role='img'
								width='20'
								height='20'
								preserveAspectRatio='xMidYMid meet'
								viewBox='0 0 128 128'>
								<path
									d='M48.3 102.32L12.65 66.87a2.2 2.2 0 0 1 0-3.12l9-9.01c.86-.86 2.25-.86 3.11 0l23.47 23.33c.86.86 2.26.85 3.12-.01l51.86-52.36c.86-.87 2.26-.87 3.13-.01l9.01 9.01c.86.86.86 2.25.01 3.11l-56.5 57.01l.01.01l-7.45 7.49c-.86.86-2.26.86-3.12 0z'
									fill='#444'
									stroke='#444'
									strokeWidth='6'
									stroke-miterlimit='10'
								/>
								<path
									d='M-27.53-17.19c-3.08-3.09-8.13-3.08-11.21 0L-63.65 7.72c-3.08 3.08-8.13 3.08-11.21 0l-24.91-24.9c-3.08-3.08-8.12-3.08-11.21 0l-6.21 6.21c-3.08 3.09-3.08 8.13 0 11.21l24.91 24.91c3.08 3.08 3.08 8.13 0 11.21l-24.91 24.91c-3.08 3.08-3.08 8.12 0 11.21l6.22 6.22c3.08 3.08 8.13 3.08 11.21 0l24.91-24.91c3.08-3.08 8.13-3.08 11.21 0l24.91 24.91c3.08 3.08 8.13 3.08 11.21 0l6.21-6.22c3.08-3.09 3.08-8.13 0-11.21l-24.91-24.9c-3.08-3.08-3.08-8.13 0-11.21L-21.31.25c3.08-3.08 3.08-8.12 0-11.21l-6.22-6.23z'
									fill='#757f3f'
								/>
							</svg>
						</div>
					) : (
						<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
							{item.name}
						</span>
					)}
					{edit ? (
						<div className='mx-2'>
							<input
								onKeyPress={(ev) => {
									if (ev.key === 'Enter') {
										ev.preventDefault()
										setEdit(false)
										handleSaveMin()
									}
								}}
								className='mb-2 w-10/12 border border-white rounded-md pl-2 text-white mx-2 bg-transparent placeholder-gray-400 text-sm font-medium appearance-none'
								onChange={handleMin}
								value={min}
							/>
						</div>
					) : (
						<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
							Min {item.min}
						</span>
					)}
					{edit ? (
						<div className='ml-2'>
							<input
								onKeyPress={(ev) => {
									if (ev.key === 'Enter') {
										ev.preventDefault()
										setEdit(false)
										handleSaveMax()
									}
								}}
								className='mb-2 w-10/12 border border-white rounded-md pl-2 text-white mx-2 bg-transparent placeholder-gray-400 text-sm font-medium appearance-none'
								onChange={handleMax}
								value={max}
							/>
						</div>
					) : (
						<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
							Max {item.max}
						</span>
					)}
				</div>
			</li>
		</ClickAwayListener>
	)
}

export default Column
