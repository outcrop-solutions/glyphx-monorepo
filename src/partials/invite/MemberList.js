// import { useMembers } from '../../../services/useMembers'

import PermissionsDropDown from './PermissionsDropDown'

export const MemberList = () => {
	// const { results } = useMembers()
	const results = [
		{ author: 'James Graham' },
		{ author: 'Michael Wicks' },
		{ author: 'Bryan Holster' },
		{ author: 'William Linczer' },
		{ author: 'Kyla McAndrews' },
	]
	return (
		<ul className='my-4 h-40 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300'>
			{results.length > 0 ? (
				<>
					{results.map((item, idx) => (
						<li key={item.id}>
							<div className='flex items-center justify-between mb-2 w-full'>
								<div className='flex items-center'>
									<div
										className={`rounded-full ${
											idx % 2 === 0 ? 'bg-blue-600' : 'bg-yellow-400'
										} h-8 w-8 text-sm text-white flex items-center justify-center mr-2`}>
										{`${item.author.split('@')[0][0].toUpperCase()}`}
									</div>
									<div className='w-10/12 text-white text-xs'>
										{item.author}
									</div>
								</div>
								<PermissionsDropDown />
							</div>
						</li>
					))}
				</>
			) : null}
		</ul>
	)
}
