import { useEffect, useState } from 'react'
import FilterActions from './actions'
function Filter({ item }) {
	const [show, setShow] = useState(false)

	return (
		<li className='mb-1 last:mb-0 flex justify-between w-full pr-4'>
			{/* filter icon */}
			<div className='flex'>
				<div className='flex items-center justify-center h-6 w-6 mr-2'>
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
				<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
					<span className='text-sm font-medium lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
						{item.name}
					</span>
				</div>
			</div>
			<FilterActions show={show} />
		</li>
	)
}

export default Filter
