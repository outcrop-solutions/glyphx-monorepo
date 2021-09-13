import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Transition from '../utils/Transition'

function DropdownNotifications({ align, grid, setGrid }) {
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
				// onClick={() => setDropdownOpen(!dropdownOpen)}
				aria-expanded={dropdownOpen}>
				<span className='sr-only'>Notifications</span>
				{grid ? (
					<svg
						onClick={() => setGrid((prev) => !prev)}
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M6.5 11H9.5C10.325 11 11 10.325 11 9.5V6.5C11 5.675 10.325 5 9.5 5H6.5C5.675 5 5 5.675 5 6.5V9.5C5 10.325 5.675 11 6.5 11Z'
							fill='white'
						/>
						<path
							d='M6.5 19H9.5C10.325 19 11 18.325 11 17.5V14.5C11 13.675 10.325 13 9.5 13H6.5C5.675 13 5 13.675 5 14.5V17.5C5 18.325 5.675 19 6.5 19Z'
							fill='white'
						/>
						<path
							d='M13 6.5V9.5C13 10.325 13.675 11 14.5 11H17.5C18.325 11 19 10.325 19 9.5V6.5C19 5.675 18.325 5 17.5 5H14.5C13.675 5 13 5.675 13 6.5Z'
							fill='white'
						/>
						<path
							d='M14.5 19H17.5C18.325 19 19 18.325 19 17.5V14.5C19 13.675 18.325 13 17.5 13H14.5C13.675 13 13 13.675 13 14.5V17.5C13 18.325 13.675 19 14.5 19Z'
							fill='white'
						/>
					</svg>
				) : (
					<svg
						onClick={() => setGrid((prev) => !prev)}
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M4.88889 14H6.66667C7.15556 14 7.55556 13.6 7.55556 13.1111V11.3333C7.55556 10.8444 7.15556 10.4444 6.66667 10.4444H4.88889C4.4 10.4444 4 10.8444 4 11.3333V13.1111C4 13.6 4.4 14 4.88889 14ZM4.88889 18.4444H6.66667C7.15556 18.4444 7.55556 18.0444 7.55556 17.5556V15.7778C7.55556 15.2889 7.15556 14.8889 6.66667 14.8889H4.88889C4.4 14.8889 4 15.2889 4 15.7778V17.5556C4 18.0444 4.4 18.4444 4.88889 18.4444ZM4.88889 9.55556H6.66667C7.15556 9.55556 7.55556 9.15556 7.55556 8.66667V6.88889C7.55556 6.4 7.15556 6 6.66667 6H4.88889C4.4 6 4 6.4 4 6.88889V8.66667C4 9.15556 4.4 9.55556 4.88889 9.55556ZM9.33333 14H19.1111C19.6 14 20 13.6 20 13.1111V11.3333C20 10.8444 19.6 10.4444 19.1111 10.4444H9.33333C8.84444 10.4444 8.44444 10.8444 8.44444 11.3333V13.1111C8.44444 13.6 8.84444 14 9.33333 14ZM9.33333 18.4444H19.1111C19.6 18.4444 20 18.0444 20 17.5556V15.7778C20 15.2889 19.6 14.8889 19.1111 14.8889H9.33333C8.84444 14.8889 8.44444 15.2889 8.44444 15.7778V17.5556C8.44444 18.0444 8.84444 18.4444 9.33333 18.4444ZM8.44444 6.88889V8.66667C8.44444 9.15556 8.84444 9.55556 9.33333 9.55556H19.1111C19.6 9.55556 20 9.15556 20 8.66667V6.88889C20 6.4 19.6 6 19.1111 6H9.33333C8.84444 6 8.44444 6.4 8.44444 6.88889Z'
							fill='white'
						/>
					</svg>
				)}
			</button>

			<Transition
				className={`origin-top-right z-10 absolute top-full -mr-48 sm:mr-0 min-w-80 bg-white border border-gray-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
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
					<div className='text-xs font-semibold text-gray-400 uppercase pt-1.5 pb-2 px-4'>
						Notifications
					</div>
					<ul>
						<li className='border-b border-gray-200 last:border-0'>
							<Link
								className='block py-2 px-4 hover:bg-gray-50'
								to='#0'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<span className='block text-sm mb-2'>
									📣{' '}
									<span className='font-medium text-gray-800'>
										Edit your information in a swipe
									</span>{' '}
									Sint occaecat cupidatat non proident, sunt in culpa qui
									officia deserunt mollit anim.
								</span>
								<span className='block text-xs font-medium text-gray-400'>
									Feb 12, 2021
								</span>
							</Link>
						</li>
						<li className='border-b border-gray-200 last:border-0'>
							<Link
								className='block py-2 px-4 hover:bg-gray-50'
								to='#0'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<span className='block text-sm mb-2'>
									📣{' '}
									<span className='font-medium text-gray-800'>
										Edit your information in a swipe
									</span>{' '}
									Sint occaecat cupidatat non proident, sunt in culpa qui
									officia deserunt mollit anim.
								</span>
								<span className='block text-xs font-medium text-gray-400'>
									Feb 9, 2021
								</span>
							</Link>
						</li>
						<li className='border-b border-gray-200 last:border-0'>
							<Link
								className='block py-2 px-4 hover:bg-gray-50'
								to='#0'
								onClick={() => setDropdownOpen(!dropdownOpen)}>
								<span className='block text-sm mb-2'>
									🚀
									<span className='font-medium text-gray-800'>
										Say goodbye to paper receipts!
									</span>{' '}
									Sint occaecat cupidatat non proident, sunt in culpa qui
									officia deserunt mollit anim.
								</span>
								<span className='block text-xs font-medium text-gray-400'>
									Jan 24, 2020
								</span>
							</Link>
						</li>
					</ul>
				</div>
			</Transition>
		</div>
	)
}

export default DropdownNotifications
