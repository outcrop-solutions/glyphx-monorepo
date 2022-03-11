import { useState, useRef, useEffect } from 'react'
import Transition from '../../utils/Transition'

function LinkDropDown({ align }) {
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
				<span className='sr-only'>Anyone with the link</span>
				<svg
					width='16'
					height='16'
					viewBox='0 0 16 16'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M8.36396 4.02315L6.6669 5.6798L7.51543 6.50813L9.21249 4.85148C9.91252 4.16811 11.058 4.16811 11.7581 4.85148C12.4581 5.53485 12.4581 6.65309 11.7581 7.33646L10.061 8.99311L10.9095 9.82143L12.6066 8.16478C13.7776 7.02169 13.7776 5.16624 12.6066 4.02315C11.4356 2.88006 9.53493 2.88006 8.36396 4.02315ZM9.21249 9.82143L7.51543 11.4781C6.8154 12.1615 5.66988 12.1615 4.96985 11.4781C4.26981 10.7947 4.26981 9.67648 4.96985 8.99311L6.6669 7.33646L5.81838 6.50813L4.12132 8.16478C2.95035 9.30787 2.95035 11.1633 4.12132 12.3064C5.29229 13.4495 7.19299 13.4495 8.36396 12.3064L10.061 10.6498L9.21249 9.82143ZM6.24264 9.40727L9.63675 6.09397L10.4853 6.92229L7.09117 10.2356L6.24264 9.40727Z'
						fill='#595E68'
					/>
				</svg>

				<span className='mx-2 text-white text-sm'>Anyone with the link</span>
				<svg
					width='16'
					height='16'
					viewBox='0 0 16 16'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M11.0969 6.21938L8.18687 9.12938L5.27687 6.21938C4.98437 5.92687 4.51187 5.92687 4.21937 6.21938C3.92688 6.51188 3.92688 6.98438 4.21937 7.27688L7.66188 10.7194C7.95438 11.0119 8.42688 11.0119 8.71938 10.7194L12.1619 7.27688C12.4544 6.98438 12.4544 6.51188 12.1619 6.21938C11.8694 5.93437 11.3894 5.92687 11.0969 6.21938Z'
						fill='#595E68'
					/>
				</svg>
			</button>

			<Transition
				className={`origin-top-right z-10 absolute top-full min-w-44 bg-primary-dark-blue border border-gray-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
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

export default LinkDropDown
