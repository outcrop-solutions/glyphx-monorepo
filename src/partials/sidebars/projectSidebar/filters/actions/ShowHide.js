import { useEffect, useState } from 'react'

function ShowHide(props) {
	return (
		<div className='flex items-center justify-center h-6 w-6'>
			{props.show ? (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 24 24'>
					<g fill='none'>
						<path
							d='M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19c-4.182 0-7.764-4.013-9.257-5.962a1.692 1.692 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5c4.182 0 7.764 4.013 9.257 5.962z'
							stroke='white'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
						/>
						<circle
							cx='12'
							cy='12'
							r='3'
							stroke='white'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
						/>
					</g>
				</svg>
			) : (
				<svg
					aria-hidden='true'
					role='img'
					width='16'
					height='16'
					preserveAspectRatio='xMidYMid meet'
					viewBox='0 0 1024 1024'>
					<path
						d='M508 624a112 112 0 0 0 112-112c0-3.28-.15-6.53-.43-9.74L498.26 623.57c3.21.28 6.45.43 9.74.43zm370.72-458.44L836 122.88a8 8 0 0 0-11.31 0L715.37 232.23Q624.91 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 0 0 0 51.5q56.7 119.43 136.55 191.45L112.56 835a8 8 0 0 0 0 11.31L155.25 889a8 8 0 0 0 11.31 0l712.16-712.12a8 8 0 0 0 0-11.32zM332 512a176 176 0 0 1 258.88-155.28l-48.62 48.62a112.08 112.08 0 0 0-140.92 140.92l-48.62 48.62A175.09 175.09 0 0 1 332 512z'
						fill='#595e68'
					/>
					<path
						d='M942.2 486.2Q889.4 375 816.51 304.85L672.37 449A176.08 176.08 0 0 1 445 676.37L322.74 798.63Q407.82 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 0 0 0-51.5z'
						fill='#595e68'
					/>
				</svg>
			)}
		</div>
	)
}

export default ShowHide
