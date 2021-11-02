import AddFilter from './AddFilter'
import DeleteFilter from './DeleteFilter'
import EditFilter from './EditFilter'
import ShowHide from './ShowHide'

function FilterActions(props) {
	return (
		<div className='flex justify-between'>
			{/* Add Filter */}
			<AddFilter />
			{/* Delete Filter */}
			<DeleteFilter />
			{/* show/hide filter */}
			<ShowHide show={props.show} />
			{/* edit filter */}
			<EditFilter />
		</div>
	)
}
export default FilterActions
