import React, { useState } from 'react'

import Sidebar from '../partials/Sidebar'
import Header from '../partials/Header'
import ProjectCard from '../partials/projects/ProjectCard'
import TableView from '../partials/projects/TableView'

import Image01 from '../images/user-28-01.jpg'
import Image02 from '../images/user-28-02.jpg'
import Image03 from '../images/user-28-03.jpg'
import Image04 from '../images/user-28-04.jpg'
import Image05 from '../images/user-28-05.jpg'
import Image06 from '../images/user-28-06.jpg'
import Image07 from '../images/user-28-07.jpg'
import Image08 from '../images/user-28-08.jpg'
import Image09 from '../images/user-28-09.jpg'
import Image10 from '../images/user-28-10.jpg'
import Image11 from '../images/user-28-11.jpg'
import Image12 from '../images/user-28-12.jpg'

function Projects() {
	const [grid, setGrid] = useState(true)
	const items = [
		{
			id: 0,
			category: '1',
			members: [
				{
					name: 'User 01',
					image: Image01,
					link: '#0',
				},
				{
					name: 'User 02',
					image: Image02,
					link: '#0',
				},
				{
					name: 'User 03',
					image: Image03,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'One-Time',
		},
		{
			id: 1,
			category: '2',
			members: [
				{
					name: 'User 04',
					image: Image04,
					link: '#0',
				},
				{
					name: 'User 05',
					image: Image05,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'Off-Track',
		},
		{
			id: 3,
			category: '3',
			members: [
				{
					name: 'User 07',
					image: Image07,
					link: '#0',
				},
				{
					name: 'User 08',
					image: Image08,
					link: '#0',
				},
				{
					name: 'User 09',
					image: Image09,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'At Risk',
		},
		{
			id: 4,
			category: '1',
			members: [
				{
					name: 'User 10',
					image: Image10,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'At Risk',
		},
		{
			id: 5,
			category: '4',
			members: [
				{
					name: 'User 11',
					image: Image11,
					link: '#0',
				},
				{
					name: 'User 05',
					image: Image05,
					link: '#0',
				},
				{
					name: 'User 12',
					image: Image12,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'One-Time',
		},
		{
			id: 6,
			category: '2',
			members: [
				{
					name: 'User 07',
					image: Image07,
					link: '#0',
				},
				{
					name: 'User 04',
					image: Image04,
					link: '#0',
				},
				{
					name: 'User 11',
					image: Image11,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'At Risk',
		},
		{
			id: 7,
			category: '4',
			members: [
				{
					name: 'User 01',
					image: Image01,
					link: '#0',
				},
				{
					name: 'User 02',
					image: Image02,
					link: '#0',
				},
				{
					name: 'User 06',
					image: Image06,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'One-Time',
		},
		{
			id: 8,
			category: '1',
			members: [
				{
					name: 'User 09',
					image: Image09,
					link: '#0',
				},
				{
					name: 'User 01',
					image: Image01,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'Off-Track',
		},
		{
			id: 9,
			category: '3',
			members: [
				{
					name: 'User 07',
					image: Image07,
					link: '#0',
				},
				{
					name: 'User 08',
					image: Image08,
					link: '#0',
				},
				{
					name: 'User 09',
					image: Image09,
					link: '#0',
				},
				{
					name: 'User 06',
					image: Image06,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'One-Time',
		},
		{
			id: 10,
			category: '4',
			members: [
				{
					name: 'User 06',
					image: Image06,
					link: '#0',
				},
				{
					name: 'User 11',
					image: Image11,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'Off-Track',
		},
		{
			id: 11,
			category: '2',
			members: [
				{
					name: 'User 05',
					image: Image05,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'Off-Track',
		},
		{
			id: 12,
			category: '3',
			members: [
				{
					name: 'User 07',
					image: Image07,
					link: '#0',
				},
				{
					name: 'User 08',
					image: Image08,
					link: '#0',
				},
				{
					name: 'User 09',
					image: Image09,
					link: '#0',
				},
			],
			title: 'Monitor progress in Real Time Value',
			link: '#0',
			content:
				'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts.',
			type: 'At Risk',
		},
	]

	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className='flex h-screen overflow-hidden bg-gray-900'>
			{/* Sidebar */}
			<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			{/* Content area */}
			<div className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
				{/*  Site header */}
				<Header
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					grid={grid}
					setGrid={setGrid}
				/>

				<main>
					<div className='px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto'>
						{grid ? (
							<TableView />
						) : (
							<>
								{/* Page header */}
								<div className='sm:flex sm:justify-between sm:items-center mb-8'>
									{/* Left: Title */}
									<div className='mb-4 sm:mb-0'>
										<h1 className='text-xl md:text-2xl text-white font-thin'>
											Recently Used Templates
										</h1>
									</div>
								</div>

								{/* Cards */}
								<div className='grid grid-cols-12 gap-6'>
									{items.map((item, idx) => {
										return (
											<ProjectCard
												idx={idx}
												key={item.id}
												id={item.id}
												category={item.category}
												members={item.members}
												title={item.title}
												link={item.link}
												content={item.content}
												type={item.type}
											/>
										)
									})}
								</div>
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}

export default Projects
