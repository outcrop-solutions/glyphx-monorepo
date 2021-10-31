import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { useLocation } from 'react-router-dom'
import { API, graphqlOperation } from 'aws-amplify'
import { listComments } from '../../graphql/queries'

export const CommentsSidebar = ({ project, setPosition, user }) => {
	const location = useLocation()
	const { pathname } = location
	// get sidebar exapanded from local storage
	const storedSidebarExpanded = localStorage.getItem(
		'comments-sidebar-expanded'
	)

	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [comments, setComments] = useState([])
	const [commentContent, setCommentContent] = useState('')
	const [sidebarExpanded, setSidebarExpanded] = useState(
		storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	)

	const trigger = useRef(null)
	const sidebar = useRef(null)
	const commentRef = useRef(null)

	useEffect(() => {
		fetchComments()
	}, []) //fetch comments
	useEffect(() => {
		console.log({ position: sidebar.current.getBoundingClientRect() })
		setPosition(sidebar.current.getBoundingClientRect())
	}, [sidebar]) //get rectangle bounding box coordinates
	useEffect(() => {
		const clickHandler = ({ target }) => {
			if (!sidebar.current || !trigger.current) return
			if (
				!sidebarOpen ||
				sidebar.current.contains(target) ||
				trigger.current.contains(target)
			)
				return
			setSidebarOpen(false)
		}
		document.addEventListener('click', clickHandler)
		return () => document.removeEventListener('click', clickHandler)
	}) // close on click outside
	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!sidebarOpen || keyCode !== 221) return
			setSidebarOpen(false)
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	}) // close if the esc key is pressed
	useEffect(() => {
		localStorage.setItem('comments-sidebar-expanded', sidebarExpanded)
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('comments-sidebar-expanded')
		} else {
			document
				.querySelector('body')
				.classList.remove('comments-sidebar-expanded')
		}
	}, [sidebarExpanded]) //handle sidebar local storage

	// fetch commetn data
	const fetchComments = async () => {
		try {
			const commentData = await API.graphql(graphqlOperation(listComments))
			const commentList = commentData.data.listComments.items

			console.log({ commentList })
			setComments((prev) => {
				let newData = [...commentList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching comments', error)
		}
	}

	const handleComment = (e) => {
		let commentInput = {
			id: uuid(),
			author: user.attributes.email,
			content: commentContent,
		}
	}

	return (
		<div
			id='sidebar'
			ref={sidebar}
			className={`hidden lg:flex flex-col absolute z-40 right-0 top-0 lg:static border-l border-gray-400 lg:right-auto lg:top-auto lg:translate-x-0 transform h-full no-scrollbar w-64 lg:w-20 lg:comments-sidebar-expanded:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
				sidebarOpen ? 'translate-y-64' : 'translate-x-0'
			}`}>
			<ul>
				<div className='flex items-center justify-between h-11 text-white border-b border-gray-400'>
					<div className='flex items-center'>
						{/* Icon */}
						{sidebarExpanded ? (
							<>
								<div className='flex flex-shrink-0 ml-2'>
									<svg
										className='w-3 h-3 flex-shrink-0 ml-1 fill-current text-gray-400 -rotate-90'
										viewBox='0 0 12 12'>
										<path d='M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z' />
									</svg>
								</div>
								<span className='text-sm font-medium ml-3 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
									Comments
								</span>
							</>
						) : (
							<div className='flex flex-shrink-0 ml-2'>
								<svg
									className='w-3 h-3 flex-shrink-0 ml-1 fill-current text-gray-400'
									viewBox='0 0 12 12'>
									<path d='M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z' />
								</svg>
							</div>
						)}
					</div>
				</div>

				{/* <div className='hidden comments-sidebar-expanded:block text-center mt-2'>
					Yesterday 6:31 PM
				</div> */}
				<div className='m-2 hidden comments-sidebar-expanded:block overflow-y-scroll'>
					{comments.length > 0 ? (
						<>
							{comments.map((item, idx) => (
								<div className='flex justify-between mb-2'>
									<div
										className={`rounded-full ${
											idx % 2 === 0 ? 'bg-blue-600' : 'bg-yellow-400'
										} h-8 w-8 text-sm text-white flex items-center justify-center`}>
										{`${item.author.split('@')[0][0].toUpperCase()}`}
									</div>
									<div className='w-10/12 text-white text-xs'>
										{item.content}
									</div>
								</div>
							))}
						</>
					) : null}
					<div className='relative'>
						<input
							className='w-full border-0  bg-transparent focus:ring-transparent placeholder-gray-400 appearance-none py-3 pl-10 pr-4'
							type='comment'
							onChange={handleComment}
							placeholder='Type comments…'
							ref={commentRef}
						/>
					</div>
				</div>
			</ul>
			{/* Expand / collapse button */}
			<div className='pt-3 hidden lg:inline-flex justify-center comments-sidebar-expanded:justify-start pb-4 mt-auto'>
				<div className='px-3 py-2'>
					<button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
						<span className='sr-only'>Expand / collapse sidebar</span>
						<svg
							className='w-6 h-6 fill-current rotate-180 comments-sidebar-expanded:rotate-0'
							viewBox='0 0 24 24'>
							<path
								className='text-gray-400'
								d='M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z'
							/>
							<path className='text-gray-600' d='M3 23H1V1h2z' />
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
export default CommentsSidebar
