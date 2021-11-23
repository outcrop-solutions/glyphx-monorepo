import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
	draggable,
	draggableHorizontal,
	draggableVertical,
} from './draggable-svg'
import styles from './Draggable.module.css'
import classNames from 'classnames'

export function Draggable(props) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		translate,
		isDragging,
		dragOverlay,
	} = useDraggable({
		id: props.id,
	})
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined

	return (
		<div
			className={classNames(
				styles.Draggable,
				dragOverlay && styles.dragOverlay,
				isDragging && styles.dragging
				// handle && styles.handle
			)}
			className='relative flex-col justify-center'
			style={style}>
			<button
				ref={setNodeRef}
				className='btn bg-gray-400 h-4 w-8 text-white'
				{...listeners}
				{...attributes}>
				{props.columnTitle ? props.columnTitle : '0'}
				{/* {draggable} */}
			</button>
		</div>
	)
}
