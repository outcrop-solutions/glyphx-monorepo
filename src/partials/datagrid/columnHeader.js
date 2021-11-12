export const ColumnHeader = ({ item }) => {
	const handleColor = (t) => {
		switch (t) {
			case 'ID':
				return 'bg-yellow-600'
				break
			case 'String':
				return 'bg-blue-600'
				break
			case 'Object':
				return 'bg-green-600'
				break
			case 'Array':
				return 'bg-blue-400'
				break
			default:
				return 'bg-gray-400'
				break
		}
	}
	return (
		<div
			className={`rounded-lg my-4 px-4 py-0.5 text-white ${handleColor(
				item.type
			)}`}>
			{item.content}{' '}
			<span className='text-xs font-thin'>
				{'<'} {item.type}
				{' >'}
			</span>
		</div>
	)
}
