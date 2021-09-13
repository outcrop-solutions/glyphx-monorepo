import React from 'react'

import Image01 from '../../images/user-28-01.jpg'
import Image02 from '../../images/user-28-02.jpg'
import Image03 from '../../images/user-28-03.jpg'
import Image04 from '../../images/user-28-04.jpg'
import Image05 from '../../images/user-28-05.jpg'
import Image06 from '../../images/user-28-06.jpg'
import Image07 from '../../images/user-28-07.jpg'
import Image09 from '../../images/user-28-09.jpg'
import Image11 from '../../images/user-28-11.jpg'

export const TableView = () => {
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
									<div className='font-semibold text-left'>Owner</div>
								</th>
								<th className='p-2 whitespace-nowrap'>
									<div className='font-semibold text-center'>File Size</div>
								</th>
							</tr>
						</thead>
						{/* Table body */}
						<tbody className='text-sm'>
							<div className='ml-2 text-lg text-gray-100'>
								Recently Used Templates
							</div>
							{/* Row */}
							<tr>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='font-medium text-white'>
											Form Builder CP
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
										<div>Me</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='text-center'>20,929</div>
								</td>
							</tr>
							{/* Row */}
							<tr>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='font-medium text-white'>
											Machine Learning A-Z
										</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex flex-shrink-0 -space-x-3 -ml-px'>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image07}
												width='28'
												height='28'
												alt='User 07'
											/>
										</a>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image04}
												width='28'
												height='28'
												alt='User 04'
											/>
										</a>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image11}
												width='28'
												height='28'
												alt='User 11'
											/>
										</a>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div>Me</div>
									</div>
								</td>

								<td className='p-2 whitespace-nowrap'>
									<div className='text-center'>7,097</div>
								</td>
							</tr>
							{/* Row */}
							<tr>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='font-medium text-white'>
											2021 Web Bootcamp
										</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex flex-shrink-0 -space-x-3 -ml-px'>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image05}
												width='28'
												height='28'
												alt='User 05'
											/>
										</a>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div>Me</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='text-center'>12,996</div>
								</td>
							</tr>
							{/* Row */}
							<tr>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='font-medium text-white'>
											Digital Marketing Course
										</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex flex-shrink-0 -space-x-3 -ml-px'>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image06}
												width='28'
												height='28'
												alt='User 06'
											/>
										</a>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image11}
												width='28'
												height='28'
												alt='User 11'
											/>
										</a>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div>Me</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='text-center'>12,996</div>
								</td>
							</tr>
							{/* Row */}
							<tr>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='font-medium text-white'>
											Form Builder PRO
										</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex flex-shrink-0 -space-x-3 -ml-px'>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image09}
												width='28'
												height='28'
												alt='User 09'
											/>
										</a>
										<a className='block' href='#0'>
											<img
												className='rounded-full border-2 border-white box-content'
												src={Image01}
												width='28'
												height='28'
												alt='User 01'
											/>
										</a>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='flex items-center'>
										<div>Me</div>
									</div>
								</td>
								<td className='p-2 whitespace-nowrap'>
									<div className='text-center'>7,097</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default TableView
