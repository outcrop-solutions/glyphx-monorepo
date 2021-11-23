import { useState } from 'react'
import { ColumnHeader } from './columnHeader'
import { Droppable, Draggable } from 'react-beautiful-dnd'

// export const Columns = ({ items, setItems, setIsEditing }) => {
export const Columns = ({ key, listId, listType, properties }) => {
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId={listId} type={listType} direction='horizontal'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${
						snapshot.isDraggingOver ? '' : ''
					} flex overflow-auto p-2 select-none m-1`}
					{...provided.droppableProps}>
					<div className='overflow-auto'>
						<div className='flex-grow inline-flex'>
							<div
								className='flex items-start'
								style={{ minWidth: '600px', minHeight: '60px' }}
								ref={provided.innerRef}>
								{properties.map((item, index) => (
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
						</div>
					</div>
				</div>
			)}
		</Droppable>
		// </DragDropContext>
	)
}
