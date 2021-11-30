import { useState } from 'react'
// import { ColumnHeader } from './columnHeader'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Property } from './Property'

// export const Properties = ({ items, setItems, setIsEditing }) => {
export const PropertyList = ({ key, listId, listType, properties }) => {
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId={listId} type={listType} direction='vertical'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${snapshot.isDraggingOver ? '' : ''}`}
					{...provided.droppableProps}>
					<div
						style={{ minWidth: '250px', minHeight: '20px' }}
						ref={provided.innerRef}>
						{properties.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{(provided, snapshot) => {
									return (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className={`${snapshot.isDragging ? '' : ''} `}>
											<Property item={item} idx={index} />
										</div>
									)
								}}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				</div>
			)}
		</Droppable>
		// </DragDropContext>
	)
}
