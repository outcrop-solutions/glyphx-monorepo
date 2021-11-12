import { PropertyIcons } from './PropertyIcons'

export const Property = ({ item, idx }) => {
	let prop = () => {
		switch (idx) {
			case 0:
				return 'x'
				break
			case 1:
				return 'y'
				break
			case 2:
				return 'z'
				break
			default:
				break
		}
	}
	return (
		<li className='mb-1 last:mb-0 flex'>
			<PropertyIcons property={prop} />
			<div className='block text-gray-400 hover:text-gray-200 transition duration-150 truncate'>
				<span className='text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200'>
					{item || ''}
				</span>
			</div>
		</li>
	)
}
