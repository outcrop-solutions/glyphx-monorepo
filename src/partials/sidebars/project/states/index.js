import React from 'react'
import { Header } from './Header'
import { useStates } from '../../../../services/useStates'
import { StateList } from './StateList'

function States({
	handleStateChange,
	state,
	setState,
	open,
	includes,
	sidebarExpanded,
	setSidebarExpanded,
	handleClick,
}) {
	const { states } = useStates(setState)
	return (
		<React.Fragment>
			<Header
				open={open}
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
				handleClick={handleClick}
			/>
			{states.length > 0 && (
				<StateList
					handleStateChange={handleStateChange}
					id={state.id}
					open={open}
					states={states}
				/>
			)}
		</React.Fragment>
	)
}

export default States
