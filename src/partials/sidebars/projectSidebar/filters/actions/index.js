import AddColumn from './AddColumn'
import DeleteFilter from './DeleteFilter'
import EditFilter from './EditFilter'
import ShowHide from './ShowHide'

function FilterActions({
	item,
	applied,
	setApplied,
	setShowCols,
	filtersApplied,
	setFiltersApplied,
}) {
	return (
		<div className='flex justify-between'>
			{/* Add Filter */}
			<AddColumn setShowCols={setShowCols} />
			{/* Delete Filter */}
			<DeleteFilter />
			{/* show/hide filter */}
			<ShowHide
				item={item}
				applied={applied}
				setApplied={setApplied}
				setFiltersApplied={setFiltersApplied}
			/>
			{/* edit filter */}
			<EditFilter />
		</div>
	)
}
export default FilterActions
