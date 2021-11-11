import React, { useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { listFilters } from '../../../../graphql/queries'
import Column from './Column'
import Filter from './Filter'
import { Header } from './Header'
import { useFilters } from '../../../../services/useFilters'

function Filters({
	filtersApplied,
	setFiltersApplied,
	columns,
	open,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	handleClick,
	showCols,
	setShowCols,
}) {
	const { filters } = useFilters()
	return (
		<React.Fragment>
			<Header
				open={open}
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
				handleClick={handleClick}
			/>
			{filters.length > 0 && (
				<div
					className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2  ${
						!open ? 'border-0 -my-2' : 'border-b border-gray-400'
					}`}>
					<ul
						style={{ height: '200px' }}
						className={`pl-2 mt-1 overflow-auto ${!open && 'hidden'}`}>
						{filters.map((item, idx) => (
							<Filter
								filtersApplied={filtersApplied}
								setFiltersApplied={setFiltersApplied}
								setShowCols={setShowCols}
								columns={columns}
								item={item}
							/>
						))}
						{showCols ? (
							<>
								{columns.length > 0 && (
									<>
										{columns.map((item, idx) => (
											<Column item={item} />
										))}
									</>
								)}
							</>
						) : null}
					</ul>
				</div>
			)}
		</React.Fragment>
	)
}

export default Filters
