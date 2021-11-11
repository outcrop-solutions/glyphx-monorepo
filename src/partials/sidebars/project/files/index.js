import React from 'react'
import { Tree } from '@minoru/react-dnd-treeview'
import { CustomNode } from './CustomNode'
import { CustomDragPreview } from './CustomDragPreview'
import styles from './css/Sidebar.module.css'
import { Header } from './Header'

export const Files = ({
	length,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	open,
	fileSystem,
	handleClick,
	handleDrop,
}) => {
	return (
		<React.Fragment>
			<Header
				length={length}
				includes={includes}
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
				handleClick={handleClick}
			/>
			<div
				className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 pl-3 ${
					!open ? 'border-0' : 'border-b border-gray-400'
				}`}>
				<Tree
					tree={fileSystem}
					rootId={0}
					render={(node, { depth, isOpen, onToggle }) => (
						<CustomNode
							node={node}
							depth={depth}
							isOpen={isOpen}
							onToggle={onToggle}
						/>
					)}
					dragPreviewRender={(monitorProps) => (
						<CustomDragPreview monitorProps={monitorProps} />
					)}
					onDrop={handleDrop}
					classes={{
						root: styles.treeRoot,
						draggingSource: styles.draggingSource,
						dropTarget: styles.dropTarget,
					}}
				/>
			</div>
		</React.Fragment>
	)
}
