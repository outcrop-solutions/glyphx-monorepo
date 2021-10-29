import React from 'react'
import { useDragOver } from '@minoru/react-dnd-treeview'
import { TypeIcon } from './TypeIcon'
import styles from './css/CustomNode.module.css'

export const CustomNode = (props) => {
	const { id, droppable, data } = props.node
	const indent = props.depth * 24

	const handleToggle = (e) => {
		e.stopPropagation()
		props.onToggle(props.node.id)
	}

	const dragOverProps = useDragOver(id, props.isOpen, props.onToggle)

	return (
		<div
			className={`tree-node ${styles.root}`}
			style={{ paddingInlineStart: indent }}
			{...dragOverProps}>
			<div
				className={`${styles.expandIconWrapper} ${
					props.isOpen ? styles.isOpen : ''
				}`}>
				{props.node.droppable && (
					<div onClick={handleToggle}>
						<svg
							aria-hidden='true'
							role='img'
							width='16'
							height='16'
							viewBox='0 0 20 20'>
							<path d='M8 6l6 4.03L8 14V6z' fill='white' />
						</svg>
					</div>
				)}
			</div>
			<div>
				<TypeIcon droppable={droppable} fileType={data?.fileType} />
			</div>
			<div className={styles.labelGridItem}>
				<div className='text-white text-sm'>{props.node.text}</div>
			</div>
		</div>
	)
}
