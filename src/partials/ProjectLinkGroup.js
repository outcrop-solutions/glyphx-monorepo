import React, { useState } from 'react'

function ProjectLinkGroup({ children, activecondition }) {
	const [open, setOpen] = useState(activecondition)

	const handleClick = () => {
		setOpen(!open)
	}

	return <div>{children(handleClick, open)}</div>
}

export default ProjectLinkGroup
