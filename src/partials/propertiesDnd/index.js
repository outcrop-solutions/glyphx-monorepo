import React, { useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { Wrapper } from './Wrapper'
import { GridContainer } from './GridContainer'
import { Droppable } from './Droppable'
import { Draggable } from './Draggable'
export const PropertiesDnd = () => {
	const containers = ['0', 'Ship Date2', 'Total Price']

	const [isDragging, setIsDragging] = useState(false)
	const [parent, setParent] = useState(null)
	const columnTitles = ['0']
	let item = <Draggable id='draggable' />
	return (
		<div className='h-full w-full'>
			<DndContext
				onDragStart={() => setIsDragging(true)}
				// onDragEnd={handleDragEnd}
				onDragEnd={({ over }) => {
					setParent(over ? over.id : null)
					setIsDragging(false)
				}}
				onDragCancel={() => setIsDragging(false)}>
				<Wrapper>
					<div className='border border-white rounded-lg relative -left-24'>
						<GridContainer columns={1}>
							{containers.map((id, idx) => (
								// We updated the Droppable component so it would accept an `id`
								// prop and pass it to `useDroppable`
								<Droppable key={id} id={id} idx={idx} dragging={isDragging}>
									{parent === id ? <Draggable id='draggable' /> : null}
								</Droppable>
							))}
						</GridContainer>
					</div>
					<div className='flex-col'>
						{columnTitles.map((item, idx) => (
							<Wrapper style={{ width: 350, flexShrink: 0 }}>
								{parent === null ? (
									<Draggable id='draggable' columnTitle={item} />
								) : null}
							</Wrapper>
						))}
					</div>
				</Wrapper>
				<DragOverlay>
					{isDragging ? <Draggable dragging dragOverlay /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	)

	function handleDragEnd(event) {
		const { over } = event

		// If the item is dropped over a container, set it as the parent
		// otherwise reset the parent to `null`
		setParent(over ? over.id : null)
	}
}
