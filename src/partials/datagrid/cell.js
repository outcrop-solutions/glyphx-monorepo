import { useState } from 'react'
export const Cell = ({ ind, index, item, setState, state }) => {
	const [content, setContent] = useState(
		item && item.content ? item.content : ''
	)
	const handleChange = (e) => {
		setContent(e.target.value)
	}
	return (
		// <div>
		<input
			className='py-1 px-2 bg-transparent'
			onChange={handleChange}
			value={item.content}
		/>
		//  <button
		// 	type='button'
		// 	onClick={() => {
		// 		const newState = [...state]
		// 		newState[ind].splice(index, 1)
		// 		setState(newState.filter((group) => group.length))
		// 	}}>
		// 	delete
		// </button>
		// </div>
	)
}
