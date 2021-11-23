import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export function Droppable({ children, dragging, id, idx }) {
	const { isOver, setNodeRef } = useDroppable({
		id: id,
	})
	const style = {
		color: isOver ? 'green' : undefined,
	}

	const handlePropName = (idx) => {
		switch (idx) {
			case 0:
				return <span >{'Property X'}</span>
				break
			case 1:
				return <span>{'Property Y'}</span>
				break

			default:
				return <span>{'Property Z'}</span>
				break
		}
	}
	return (
		<div
			ref={setNodeRef}
			className={`
				relative text-center rounded-lg w-40 h-10 px-10 bg-blue-900 z-60
				${isOver && 'bg-gray-600 text-white'}
			`}>
			<div className='h-10 text-center text-xs'>{handlePropName(idx)}</div>
			{/* {droppable} */}
			{children}
		</div>
	)
}
