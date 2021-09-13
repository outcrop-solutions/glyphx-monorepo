import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Transition from '../utils/Transition'

import UserAvatar from '../images/user.png'

function UserMenu({ align }) {
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
				className='inline-flex justify-start items-center group'
				aria-haspopup='true'
				onClick={() => setDropdownOpen(!dropdownOpen)}
				aria-expanded={dropdownOpen}>
				{/* <img className="w-8 h-8 rounded-full" src={UserAvatar} width="32" height="32" alt="User" /> */}
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M12 4C7.584 4 4 7.584 4 12C4 16.416 7.584 20 12 20C16.416 20 20 16.416 20 12C20 7.584 16.416 4 12 4ZM8.056 17.024C8.4 16.304 10.496 15.6 12 15.6C13.504 15.6 15.608 16.304 15.944 17.024C14.856 17.888 13.488 18.4 12 18.4C10.512 18.4 9.144 17.888 8.056 17.024ZM17.088 15.864C15.944 14.472 13.168 14 12 14C10.832 14 8.056 14.472 6.912 15.864C6.096 14.792 5.6 13.456 5.6 12C5.6 8.472 8.472 5.6 12 5.6C15.528 5.6 18.4 8.472 18.4 12C18.4 13.456 17.904 14.792 17.088 15.864ZM12 7.2C10.448 7.2 9.2 8.448 9.2 10C9.2 11.552 10.448 12.8 12 12.8C13.552 12.8 14.8 11.552 14.8 10C14.8 8.448 13.552 7.2 12 7.2ZM12 11.2C11.336 11.2 10.8 10.664 10.8 10C10.8 9.336 11.336 8.8 12 8.8C12.664 8.8 13.2 9.336 13.2 10C13.2 10.664 12.664 11.2 12 11.2Z'
						fill='white'
					/>
				</svg>
				<div className='flex items-center truncate'>
					<span className='truncate ml-2 text-sm text-white font-sans font-medium group-hover:text-gray-800'>
						John Doe
					</span>
				</div>
			</button>
		</div>
	)
}

export default UserMenu
