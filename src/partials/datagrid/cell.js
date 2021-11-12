export const Cell = ({ ind, index, item, setState, state }) => {
	return (
		// <div>
		<input className='py-1 px-2 bg-transparent' value={item.content} />
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
