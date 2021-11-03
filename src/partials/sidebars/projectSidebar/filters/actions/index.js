import AddFilter from './AddFilter'
import DeleteFilter from './DeleteFilter'
import EditFilter from './EditFilter'
import ShowHide from './ShowHide'

function FilterActions({ show, setShowCols }) {
	return (
		<div className='flex justify-between'>
			{/* Add Filter */}
			<AddFilter setShowCols={setShowCols} />
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
