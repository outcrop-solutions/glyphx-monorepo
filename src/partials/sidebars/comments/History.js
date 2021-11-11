import { useComments } from '../../../services/useComments'

export const History = ({ state }) => {
	const { results } = useComments(state)
	return (
		<ul>
			{results.length > 0 ? (
				<>
					{results.map((item, idx) => (
						<div className='flex justify-between mb-2'>
							<div
								className={`rounded-full ${
									idx % 2 === 0 ? 'bg-blue-600' : 'bg-yellow-400'
								} h-8 w-8 text-sm text-white flex items-center justify-center`}>
								{`${item.author.split('@')[0][0].toUpperCase()}`}
							</div>
							<div className='w-10/12 text-white text-xs'>{item.content}</div>
						</div>
					))}
				</>
			) : null}
		</ul>
	)
}
