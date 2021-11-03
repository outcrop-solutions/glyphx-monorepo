import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ClickAwayListener from 'react-click-away-listener'
import FilterActions from './actions'

function Filter({
	item,
	columns,
	setShowCols,
	filtersApplied,
	setFiltersApplied,
}) {
	const [applied, setApplied] = useState(
		filtersApplied.includes(item) ? true : false
	)
	const [edit, setEdit] = useState(false)
	const [name, setName] = useState(item.name || '')

	const handleName = (e) => {
		setName(e.target.value)
	}
	const handleSaveName = () => {}

	const handleClickAway = () => {
		setEdit(false)
	}
	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<li className='mb-1 last:mb-0 flex justify-between w-full pr-4'>
				{/* filter icon */}
				<div className='flex'>
					<div className='flex items-center justify-center h-6 w-6'>
						<svg
							aria-hidden='true'
							role='img'
							width='16'
							height='16'
							preserveAspectRatio='xMidYMid meet'
							viewBox='0 0 16 16'>
							<g fill='#aaa'>
								<path d='M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z' />
							</g>
						</svg>
					</div>
					{/* filterName */}
					<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate pl-3'>
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
										stroke-width='6'
										stroke-miterlimit='10'
									/>
									<path
										d='M-27.53-17.19c-3.08-3.09-8.13-3.08-11.21 0L-63.65 7.72c-3.08 3.08-8.13 3.08-11.21 0l-24.91-24.9c-3.08-3.08-8.12-3.08-11.21 0l-6.21 6.21c-3.08 3.09-3.08 8.13 0 11.21l24.91 24.91c3.08 3.08 3.08 8.13 0 11.21l-24.91 24.91c-3.08 3.08-3.08 8.12 0 11.21l6.22 6.22c3.08 3.08 8.13 3.08 11.21 0l24.91-24.91c3.08-3.08 8.13-3.08 11.21 0l24.91 24.91c3.08 3.08 8.13 3.08 11.21 0l6.21-6.22c3.08-3.09 3.08-8.13 0-11.21l-24.91-24.9c-3.08-3.08-3.08-8.13 0-11.21L-21.31.25c3.08-3.08 3.08-8.12 0-11.21l-6.22-6.23z'
										fill='#757f3f'
									/>
								</svg>
							</div>
						) : (
							<span
								className={`text-sm ${
									applied ? 'text-white' : 'text-gray-400'
								} font-medium lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200`}>
								{item.name}
							</span>
						)}
					</div>
				</div>

				<FilterActions
					item={item}
					applied={applied}
					setApplied={setApplied}
					setShowCols={setShowCols}
					filtersApplied={filtersApplied}
					setFiltersApplied={setFiltersApplied}
				/>
			</li>
		</ClickAwayListener>
	)
}

export default Filter
