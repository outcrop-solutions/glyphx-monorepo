import React, { useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { listFilters } from '../../../../graphql/queries'
import Column from './Column'
import Filter from './Filter'

function Filters({
	filters,
	setFilters,
	columns,
	open,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	handleClick,
}) {
	useEffect(() => {
		fetchFilters()
	}, [])
	const fetchFilters = async () => {
		try {
			const filterData = await API.graphql(graphqlOperation(listFilters))
			const filterList = filterData.data.listFilters.items

			console.log({ filterList })
			setFilters((prev) => {
				let newData = [...filterList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching filters', error)
		}
	}
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
							Filters
						</span>
					</div>
				</div>
			</a>
			{filters.length > 0 && (
				<div
					className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2  ${
						!open ? 'border-0 -my-2' : 'border-b border-gray-400'
					}`}>
					<ul
						style={{ height: '200px' }}
						className={`pl-2 mt-1 overflow-auto ${!open && 'hidden'}`}>
						{filters.map((item, idx) => (
							<Filter item={item} />
						))}
						{columns.length > 0 && (
							<>
								{columns.map((item, idx) => (
									<Column item={item} />
								))}
							</>
						)}
					</ul>
				</div>
			)}
		</React.Fragment>
	)
}

export default Filters
