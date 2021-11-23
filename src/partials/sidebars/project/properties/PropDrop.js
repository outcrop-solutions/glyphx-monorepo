import { ColumnHeader } from '../../../datagrid/columnHeader'
import { Droppable, Draggable } from 'react-beautiful-dnd'

export const PropDrop = ({ modelProps, setModelProps }) => {
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId='0' direction='horizontal'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${snapshot.isDraggingOver ? '' : ''} flex overflow-auto`}
					{...provided.droppableProps}>
					{modelProps[0].map((item, index) => (
						<Draggable key={item.id} draggableId={item.id} index={index}>
							{(provided, snapshot) => {
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
