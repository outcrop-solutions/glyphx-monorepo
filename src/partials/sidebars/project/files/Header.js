export const Header = ({
	length,
	sidebarExpanded,
	setSidebarExpanded,
	handleClick,
}) => {
	return (
		<a
			href='#0'
			className={`block text-gray-200 hover:text-white truncate border-gray-400 ${
				length > 0 ? 'border-b border-gray-400' : 'border-b'
			} transition duration-150`}
			onClick={(e) => {
				e.preventDefault()
				sidebarExpanded ? handleClick() : setSidebarExpanded(true)
			}}>
			<div
				className={`flex items-center h-11 ml-3 ${
					!sidebarExpanded ? 'w-full justify-center ml-0' : ''
				}`}>
				{/* Icon */}
				<div className='flex flex-shrink-0'>
					<svg
						aria-hidden='true'
						role='img'
						width='16'
						height='16'
						preserveAspectRatio='xMidYMid meet'
						viewBox='0 0 256 256'>
						<path
							d='M213.657 66.343l-40-40A8 8 0 0 0 168 24H88a16.018 16.018 0 0 0-16 16v16H56a16.018 16.018 0 0 0-16 16v144a16.018 16.018 0 0 0 16 16h112a16.018 16.018 0 0 0 16-16v-16h16a16.018 16.018 0 0 0 16-16V72a8 8 0 0 0-2.343-5.657zM136 192H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm0-32H88a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16zm64 24h-16v-80a8 8 0 0 0-2.343-5.657l-40-40A8 8 0 0 0 136 56H88V40h76.687L200 75.314z'
							fill='white'
						/>
					</svg>
				</div>

				{sidebarExpanded ? (
					<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
						Files
					</span>
				) : null}
				{/* </div> */}
			</div>
		</a>
	)
}
