import ProjectCard from './ProjectCard'

export const GridView = ({ projects, setProject }) => {
	return (
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
				{projects.map((item, idx) => {
					return (
						<ProjectCard
							project={item}
							setProject={setProject}
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
	)
}
