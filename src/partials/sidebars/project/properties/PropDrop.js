import { useState } from 'react'
import { ColumnHeader } from '../../../datagrid/columnHeader'
import { Droppable, Draggable } from 'react-beautiful-dnd'

export const PropDrop = ({ colHeaders, setColHeaders }) => {
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId='droppable-props' direction='vertical'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${
						snapshot.isDraggingOver ? '' : ''
					} flex-col overflow-auto`}
					{...provided.droppableProps}>
					{colHeaders.map((item, index) => (
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
