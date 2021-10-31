import React, { useState, useRef, useEffect } from 'react'
import Transition from '../utils/Transition'

function DropdownHelp({ align }) {
	const [dropdownOpen, setDropdownOpen] = useState(false)

	const trigger = useRef(null)
	const dropdown = useRef(null)

	// close on click outside
	useEffect(() => {
		const clickHandler = ({ target }) => {
			if (!dropdown.current) return
			if (
				!dropdownOpen ||
				dropdown.current.contains(target) ||
				trigger.current.contains(target)
			)
				return
			setDropdownOpen(false)
		}
		document.addEventListener('click', clickHandler)
		return () => document.removeEventListener('click', clickHandler)
	})

	// close if the esc key is pressed
	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!dropdownOpen || keyCode !== 27) return
			setDropdownOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	})

	return (
		<div className='relative inline-flex'>
			<button
				ref={trigger}
				className={
					'flex items-center justify-center hover:bg-gray-200 transition duration-150 rounded-full'
				}
				aria-haspopup='true'
				onClick={() => setDropdownOpen(!dropdownOpen)}
				aria-expanded={dropdownOpen}>
				<span className='sr-only'>Need help?</span>

				<svg
					width='16'
					height='16'
					viewBox='0 0 16 16'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M7.2 4H8.8V5.6H7.2V4ZM7.2 7.2H8.8V12H7.2V7.2ZM8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8 14.4C4.472 14.4 1.6 11.528 1.6 8C1.6 4.472 4.472 1.6 8 1.6C11.528 1.6 14.4 4.472 14.4 8C14.4 11.528 11.528 14.4 8 14.4Z'
						fill='white'
					/>
				</svg>
			</button>

			<Transition
				className={`origin-top-right z-10 absolute top-full min-w-44 bg-gray-900 border border-gray-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
					align === 'right' ? 'right-0' : 'left-0'
				}`}
				show={dropdownOpen}
				enter='transition ease-out duration-200 transform'
				enterStart='opacity-0 -translate-y-2'
				enterEnd='opacity-100 translate-y-0'
				leave='transition ease-out duration-200'
				leaveStart='opacity-100'
				leaveEnd='opacity-0'>
				<div
					ref={dropdown}
					onFocus={() => setDropdownOpen(true)}
					onBlur={() => setDropdownOpen(false)}>
					<div className='text-xs font-semibold text-white uppercase pt-1.5 pb-2 px-4'>
						Need help?
					</div>
					<ul>
						<li>
							<a
								className='font-medium text-sm text-gray-200 hover:text-gray-300 flex items-center py-1 px-3'
								href='https://docs.glyphx.co'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<svg
									className='w-3 h-3 fill-current text-gray-300 flex-shrink-0 mr-2'
									viewBox='0 0 12 12'>
									<rect y='3' width='12' height='9' rx='1' />
									<path d='M2 0h8v2H2z' />
								</svg>
								<span>Documentation</span>
							</a>
						</li>
						<li>
							<a
								className='font-medium text-sm text-gray-200 hover:text-gray-300 flex items-center py-1 px-3'
								href='https://glyphx.co'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<svg
									className='w-3 h-3 fill-current text-gray-300 flex-shrink-0 mr-2'
									viewBox='0 0 12 12'>
									<path d='M10.5 0h-9A1.5 1.5 0 000 1.5v9A1.5 1.5 0 001.5 12h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 0zM10 7L8.207 5.207l-3 3-1.414-1.414 3-3L5 2h5v5z' />
								</svg>
								<span>Support Site</span>
							</a>
						</li>
						<li>
							<a
								className='font-medium text-sm text-gray-200 hover:text-gray-300 flex items-center py-1 px-3'
								href='https://glyphx.co/company'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<svg
									className='w-3 h-3 fill-current text-gray-300 flex-shrink-0 mr-2'
									viewBox='0 0 12 12'>
									<path d='M11.854.146a.5.5 0 00-.525-.116l-11 4a.5.5 0 00-.015.934l4.8 1.921 1.921 4.8A.5.5 0 007.5 12h.008a.5.5 0 00.462-.329l4-11a.5.5 0 00-.116-.525z' />
								</svg>
								<span>Contact us</span>
							</a>
						</li>
					</ul>
				</div>
			</Transition>
		</div>
	)
}

export default DropdownHelp
