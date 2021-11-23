import React from 'react'

import Image01 from '../../images/user-28-01.jpg'
import Image02 from '../../images/user-28-02.jpg'
import Image03 from '../../images/user-28-03.jpg'

export const TableView = ({ user, projects, setProject, fetchProjects }) => {
	return (
		<div className='text-white rounded-sm'>
			<div className='p-3'>
				{/* Table */}
				<div className='overflow-x-auto'>
					<table className='table-auto w-full'>
						{/* Table header */}
						<thead className='text-xs uppercase text-gray-100 opacity-60 rounded-sm'>
							<tr>
								<th className='p-2 whitespace-nowrap'>
									<div className='font-semibold text-left'>Name</div>
								</th>
								<th className='p-2 whitespace-nowrap'>
									<div className='font-semibold text-left'>Shared With</div>
								</th>
								<th className='p-2 whitespace-nowrap'>
									<div className='font-semibold text-left'>Author</div>
								</th>
								<th className='p-2 whitespace-nowrap'>
									<div className='font-semibold text-center'>File Path</div>
								</th>
							</tr>
						</thead>
						{/* Table body */}
						<tbody className='text-sm'>
							<div className='ml-2 text-lg text-gray-100'>
								Recently Used Templates
							</div>
							{/* Row */}
							{projects.map((item, idx) => (
								<tr onClick={() => setProject(item)}>
									<td className='p-2 whitespace-nowrap'>
										<div className='flex items-center'>
											<div className='font-medium text-white cursor-pointer'>
												{item.name}
											</div>
										</div>
									</td>
									<td className='p-2 whitespace-nowrap'>
										<div className='flex flex-shrink-0 -space-x-3 -ml-px'>
											<a className='block' href='#0'>
												<img
													className='rounded-full border-2 border-white box-content'
													src={Image01}
													width='28'
													height='28'
													alt='User 01'
												/>
											</a>
											<a className='block' href='#0'>
												<img
													className='rounded-full border-2 border-white box-content'
													src={Image02}
													width='28'
													height='28'
													alt='User 02'
												/>
											</a>
											<a className='block' href='#0'>
												<img
													className='rounded-full border-2 border-white box-content'
													src={Image03}
													width='28'
													height='28'
													alt='User 03'
												/>
											</a>
										</div>
									</td>
									<td className='p-2 whitespace-nowrap'>
										<div className='flex items-center'>
											<div>{item.author}</div>
										</div>
									</td>
									<td className='p-2 whitespace-nowrap'>
										<div className='text-center'>{item.filePath}</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default TableView
