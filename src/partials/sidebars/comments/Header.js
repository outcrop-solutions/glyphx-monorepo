export const Header = ({ sidebarExpanded }) => {
	return (
		<div className='flex items-center justify-between h-11 text-white border-b border-gray-400'>
			<div className='flex items-center justify-center mx-auto'>
				{/* Icon */}
				{sidebarExpanded ? (
					<>
						<span className='text-sm font-medium ml-3 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
							Comments
						</span>
					</>
				) : (
					<div className='flex flex-shrink-0 mx-auto'>
						<svg
							aria-hidden='true'
							role='img'
							width='16'
							height='16'
							preserveAspectRatio='xMidYMid meet'
							viewBox='0 0 432 432'>
							<path
								d='M405 88q9 0 15.5 6.5T427 109v320l-86-85H107q-9 0-15.5-6.5T85 323v-43h278V88h42zm-85 128q0 9-6.5 15t-14.5 6H85L0 323V24q0-9 6.5-15T21 3h278q8 0 14.5 6t6.5 15v192z'
								fill='white'
							/>
						</svg>
					</div>
				)}
			</div>
		</div>
	)
}
