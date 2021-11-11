import React, { useEffect, useState } from 'react'
import { Header } from './Header'
import { Property } from './Property'

function Properties({
	properties,
	open,
	handleClick,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
}) {
	const [propertiesArr, setPropertiesArr] = useState([])
	useEffect(() => {
		setPropertiesArr([properties.x, properties.y, properties.z])
	}, [properties])
	return (
		<React.Fragment>
			<Header
				open={open}
				handleClick={handleClick}
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
			/>
			<div
				className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 ${
					!open ? 'border-0 -my-2' : 'border-b border-gray-400'
				}`}>
				<ul className={`pl-2 mt-1 ${!open && 'hidden'}`}>
					{propertiesArr.map((item, idx) => (
						<Property item={item} idx={idx}></Property>
					))}
				</ul>
			</div>
		</React.Fragment>
	)
}

export default Properties
