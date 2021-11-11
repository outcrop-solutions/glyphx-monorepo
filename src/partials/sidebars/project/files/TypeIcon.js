import React from 'react'

export const TypeIcon = (props) => {
	if (props.droppable) {
		return (
			<svg
				aria-hidden='true'
				role='img'
				width='16'
				height='16'
				preserveAspectRatio='xMidYMid meet'
				viewBox='0 0 1024 1024'>
				<path
					d='M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32z'
					fill='white'
				/>
			</svg>
		)
	}

	switch (props.fileType) {
		case 'image':
			return (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 16 16'>
					<g fill='white'>
						<path d='M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71l-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0z' />
					</g>
				</svg>
			)
		case 'csv':
			return (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 15 15'>
					<g fill='none'>
						<path
							fill-rule='evenodd'
							clip-rule='evenodd'
							d='M1 1.5A1.5 1.5 0 0 1 2.5 0h8.207L14 3.293V13.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 1 13.5v-12zM2 6h3v1H3v3h2v1H2V6zm7 0H6v3h2v1H6v1h3V8H7V7h2V6zm2 0h-1v3.707l1.5 1.5l1.5-1.5V6h-1v3.293l-.5.5l-.5-.5V6z'
							fill='white'
						/>
					</g>
				</svg>
			)
		case 'zip':
			return (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 1024 1024'>
					<path
						d='M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM296 136v64h64v-64h-64zm64 64v64h64v-64h-64zm-64 64v64h64v-64h-64zm64 64v64h64v-64h-64zm-64 64v64h64v-64h-64zm64 64v64h64v-64h-64zm-64 64v64h64v-64h-64zm0 64v160h128V584H296zm48 48h32v64h-32v-64z'
						fill='white'
					/>
				</svg>
			)
		case 'text':
			return (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 1024 1024'>
					<path
						d='M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM320 482a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320z'
						fill='white'
					/>
				</svg>
			)
		case 'json':
			return (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 24 24'>
					<path
						d='M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3h2m-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1z'
						fill='white'
					/>
				</svg>
			)
		default:
			return null
	}
}
