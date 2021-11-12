import { useState, useEffect } from 'react'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// fake data generator
// const getItems = (count) =>
// 	Array.from({ length: count }, (v, k) => k).map((k) => ({
// 		id: `item-${k}`,
// 		content: `item ${k}`,
// 	}))

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)
	return result
}

const grid = 8

const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',

	// change style if dragging
	background: isDragging ? '' : '',

	// styles we need to apply on draggables
	...draggableStyle,
})

const getListStyle = (isDraggingOver) => ({
	background: isDraggingOver ? '' : '',
})

export const Dnd = ({ items }) => {
	const [itemsArr, setItemsArr] = useState(items ? items : [])

	useEffect(() => {
		setItemsArr([...items])
	}, [items])

	const onDragEnd = (result) => {
		// dropped outside the list
		if (!result.destination) {
			return
		}

		const newItems = reorder(
			items,
			result.source.index,
			result.destination.index
		)

		setItemsArr([...newItems])
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='droppable'>
				{(provided, snapshot) => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
						style={getListStyle(snapshot.isDraggingOver)}>
						{itemsArr.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										style={getItemStyle(
											snapshot.isDragging,
											provided.draggableProps.style
										)}>
										{item.content}
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	)
}
