import { useState } from 'react'
import { ColumnHeader } from './columnHeader'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)

	return result
}

export const Columns = () => {
	const [items, setItems] = useState([
		{
			id: `item-0`,
			content: 'objectId',
			type: 'ID',
		},
		{
			id: `item-1`,
			content: 'firstName',
			type: 'String',
		},
		{
			id: `item-2`,
			content: 'lastName',
			type: 'String',
		},
		{
			id: `item-3`,
			content: 'settings',
			type: 'Object',
		},
		{
			id: `item-4`,
			content: 'collaborators',
			type: 'Array',
		},
	])

	function onDragEnd(result) {
		// dropped outside the list
		if (!result.destination) {
			return
		}

		const newItems = reorder(
			items,
			result.source.index,
			result.destination.index
		)

		setItems(newItems)
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='droppable' direction='horizontal'>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						className={`${
							snapshot.isDraggingOver ? '' : ''
						} flex overflow-auto`}
						{...provided.droppableProps}>
						{items.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{(provided, snapshot) => {
									console.log({
										color: `${snapshot.isDragging ? '' : ''} ${
											item.color
										}`,
									})
									return (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className={`${
												snapshot.isDragging ? '' : ''
											} min-w-56 max-w-min flex `}>
											<ColumnHeader item={item} />
										</div>
									)
								}}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	)
}
