import { Droppable, Draggable } from 'react-beautiful-dnd'

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
export const Widgets = ({ key, listId, listType, properties }) => {
	return (
		// <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
		<Droppable droppableId={listId} type={listType} direction='vertical'>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					className={`${snapshot.isDraggingOver ? '' : ''}`}
					{...provided.droppableProps}>
					<div
						// className='flex-col items-start'
						// style={{ minWidth: '250px', minHeight: '60px' }}
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
											{item.content}
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
