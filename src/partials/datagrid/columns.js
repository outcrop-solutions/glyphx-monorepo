import { useState } from 'react'
import { ColumnHeader } from './columnHeader'
import { Droppable, Draggable } from 'react-beautiful-dnd'

// export const Columns = ({ items, setItems, setIsEditing }) => {
export const Columns = ({ setIsEditing }) => {
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
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId='droppable' direction='horizontal'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${snapshot.isDraggingOver ? '' : ''} flex overflow-auto`}
					{...provided.droppableProps}>
					{items.map((item, index) => (
						<Draggable key={item.id} draggableId={item.id} index={index}>
							{(provided, snapshot) => {
								// console.log({
								// 	color: `${snapshot.isDragging ? '' : ''} ${
								// 		item.color
								// 	}`,
								// })
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
		// </DragDropContext>
	)
}
