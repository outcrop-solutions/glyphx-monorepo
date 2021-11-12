import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Cell } from './cell'

// fake data generator
const getItems = (count, offset = 0) =>
	Array.from({ length: count }, (v, k) => k).map((k) => ({
		id: `item-${k + offset}-${new Date().getTime()}`,
		content: `item ${k + offset}`,
	}))

const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)

	return result
}

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
	const sourceClone = Array.from(source)
	const destClone = Array.from(destination)
	const [removed] = sourceClone.splice(droppableSource.index, 1)

	destClone.splice(droppableDestination.index, 0, removed)

	const result = {}
	result[droppableSource.droppableId] = sourceClone
	result[droppableDestination.droppableId] = destClone

	return result
}

const getItemStyle = (isDragging) =>
	`${isDragging ? '' : 'border border-gray-200 border-1'}`
const getListStyle = (isDraggingOver) =>
	`${isDraggingOver ? '' : 'min-w-56 max-w-min'}`

export const DataGrid = () => {
	const [state, setState] = useState([
		getItems(10),
		getItems(10),
		getItems(10),
		getItems(10),
		getItems(10),
	])

	function onDragEnd(result) {
		const { source, destination } = result

		// dropped outside the list
		if (!destination) {
			return
		}
		const sInd = +source.droppableId
		const dInd = +destination.droppableId

		if (sInd === dInd) {
			const items = reorder(state[sInd], source.index, destination.index)
			const newState = [...state]
			newState[sInd] = items
			setState(newState)
		} else {
			const result = move(state[sInd], state[dInd], source, destination)
			const newState = [...state]
			newState[sInd] = result[sInd]
			newState[dInd] = result[dInd]

			setState(newState.filter((group) => group.length))
		}
	}

	return (
		<div className='overflow-x-scroll w-full'>
			{/* <button
				type='button'
				onClick={() => {
					setState([...state, []])
				}}>
				Add new group
			</button>
			<button
				type='button'
				onClick={() => {
					setState([...state, getItems(1)])
				}}>
				Add new item
			</button> */}
			<div style={{ display: 'flex' }}>
				<DragDropContext onDragEnd={onDragEnd}>
					{state.map((el, ind) => (
						<Droppable key={ind} droppableId={`${ind}`}>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									className={getListStyle(snapshot.isDraggingOver)}
									{...provided.droppableProps}>
									{el.map((item, index) => (
										<Draggable
											key={item.id}
											draggableId={item.id}
											index={index}>
											{(provided, snapshot) => {
												return (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														style={provided.draggableProps.style}
														className={getItemStyle(snapshot.isDragging)}>
														<Cell
															ind={ind}
															index={index}
															item={item}
															state={state}
															setState={setState}
														/>
													</div>
												)
											}}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					))}
				</DragDropContext>
			</div>
		</div>
	)
}
