import React, { useState, useEffect } from 'react'
import { Tree } from '@minoru/react-dnd-treeview'
import { CustomNode } from './CustomNode'
import { CustomDragPreview } from './CustomDragPreview'
import styles from './css/Sidebar.module.css'
import { Header } from './Header'
import { useFileSystem } from '../../../../services/useFileSystem'
import { Dropzone } from '../../../actions/Dropzone'

export const Files = ({
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	open,
	handleClick,
	project,
}) => {
	const [files, setFiles] = useState({})
	const { fileSystem } = useFileSystem(project)
	const [length, setLength] = useState(
		fileSystem ? Object.keys(fileSystem).length : 0
	)

	useEffect(() => {
		setLength(Object.keys(fileSystem).length)
		setFiles(fileSystem)
	}, [fileSystem])
	const handleDrop = (newTree) => setFiles(newTree)
	return (
		<React.Fragment>
			<Header
				length={length}
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
				handleClick={handleClick}
			/>
			<div
				className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 pl-3 ${
					!open ? 'border-0' : 'border-b border-gray-400'
				}`}>
				{files && Object.keys(files).length > 0 ? (
					<Tree
						tree={files}
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
				) : null}
				<Dropzone setFiles={setFiles} />
			</div>
		</React.Fragment>
	)
}
