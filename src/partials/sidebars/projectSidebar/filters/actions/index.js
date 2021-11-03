import AddColumn from './AddColumn'
import DeleteFilter from './DeleteFilter'
import EditFilter from './EditFilter'
import ShowHide from './ShowHide'

function FilterActions({
	show,
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
			<ShowHide show={show} />
			{/* edit filter */}
			<EditFilter />
		</div>
	)
}
export default FilterActions
