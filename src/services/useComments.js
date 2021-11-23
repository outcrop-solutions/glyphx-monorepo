import { useState, useEffect } from 'react'
import { useStates } from './useStates'
import { API } from 'aws-amplify'
import { listComments } from '../graphql/queries'

export const useComments = () => {
	const [comments, setComments] = useState([])
	const { state } = useStates()
	// fetch comments
	const fetchComments = async () => {
		if (typeof state !== 'undefined') {
			try {
				console.log({ state })
				let filter = {
					stateID: {
						eq: state.id, // filter priority = 1
					},
				}
				// console.log({ stateID: state })
				const commentsData = await API.graphql({
					query: listComments,
					variables: { filter: filter },
				})
				const commentList = commentsData.data.listComments.items
				const reordered = commentList.reverse()
				console.log({ commentsData })
				// console.log({ stateData })
				setComments((prev) => {
					let newData = [...reordered]
					return newData
				})
			} catch (error) {
				console.log('error on fetching comments', error)
			}
		}
	}

	useEffect(() => {
		if (state) {
			fetchComments()
		}
	}, [state])

	return { results: comments }
}
