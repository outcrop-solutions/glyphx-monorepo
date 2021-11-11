import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { API, graphqlOperation } from 'aws-amplify'
import { createComment } from '../../../graphql/mutations'

export const CommentInput = ({ user, state, setComments }) => {
	const [commentContent, setCommentContent] = useState('')

	// update comment state
	const handleComment = (e) => {
		setCommentContent(e.target.value)
	}
	// save comment to DynamoDB
	const handleSaveComment = async () => {
		if (typeof state !== 'undefined') {
			let commentInput = {
				id: uuid(),
				author: user.attributes.email,
				content: commentContent,
				stateID: state.id,
			}
			try {
				setComments((prev) => [...prev, commentInput])
				setCommentContent('')
				await API.graphql(
					graphqlOperation(createComment, { input: commentInput })
				)
			} catch (error) {
				console.log({ error })
			}
		}
	}
	return (
		<div
			onKeyPress={(ev) => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					handleSaveComment()
				}
			}}
			className='relative flex items-center justify-around'>
			<input
				className='w-10/12 border-0 focus:ring-2 focus:ring-red-600  bg-transparent placeholder-gray-400 py-1 rounded-md'
				onChange={handleComment}
				value={commentContent}
				placeholder='Type comments…'
			/>
			<svg
				onClick={handleSaveComment}
				aria-hidden='true'
				role='img'
				width='16'
				height='16'
				preserveAspectRatio='xMidYMid meet'
				viewBox='0 0 24 24'>
				<path
					d='M21.426 11.095l-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909l-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z'
					fill='white'
				/>
			</svg>
		</div>
	)
}
