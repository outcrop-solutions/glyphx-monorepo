import ExpandCollapse from './ExpandCollapse'
import { Widgets } from './Widgets'

export const ProjectSidebar = ({
	sidebarExpanded,
	setSidebarExpanded,
	modelProps,
	sidebar,
	sidebarOpen,
}) => {
	//utilities
	

	return (
		<div
			id='sidebar'
			ref={sidebar}
			className={`flex flex-col bg-gray-900 absolute z-30 left-0 top-0 lg:static border-r border-gray-400 lg:left-auto lg:top-auto lg:translate-x-0 transform  h-full no-scrollbar w-64 lg:w-20 lg:project-sidebar-expanded:!w-64 2xl:!w-64 flex-shrink-0 transition-all duration-200 ease-in-out ${
				sidebarOpen ? 'translate-x-0' : '-translate-x-64'
			}`}>
			<div>
				{/* Files */}
				{Object.keys(modelProps.propMap).map((key, index) => {
					if (
						key === 'WIDGETS'
					) {
						return (
							<Widgets
								key={key}
								listId={key}
								listType='CARD'
								properties={modelProps.propMap[key]}
							/>
						)
					}
				})}
			</div>
			<div className='sticky bottom-0'>
				<ExpandCollapse
					sidebarExpanded={sidebarExpanded}
					setSidebarExpanded={setSidebarExpanded}
				/>
			</div>
		</div>
	)
}
export default ProjectSidebar
