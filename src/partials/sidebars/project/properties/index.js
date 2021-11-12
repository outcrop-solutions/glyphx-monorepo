import React, { useEffect, useState } from 'react'
import { Header } from './Header'
import { Property } from './Property'
import { useProperties } from '../../../../services/useProperties'

function Properties({
	project,
	open,
	handleClick,
	sidebarExpanded,
	setSidebarExpanded,
}) {
	const [propertiesArr, setPropertiesArr] = useState([])
	const { properties } = useProperties(project)
	useEffect(() => {
		if (properties.x && properties.y && properties.z)
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
					{propertiesArr > 0
						? propertiesArr.map((item, idx) => (
								<Property item={item} idx={idx} />
						  ))
						: null}
				</ul>
			</div>
		</React.Fragment>
	)
}

export default Properties
