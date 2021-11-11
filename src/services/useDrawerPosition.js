import { useEffect, useState } from 'react'
// comments and filter sidebar positions
// position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
//position state dynamically changes with transitions
export const useDrawerPosition = ({
	commentsPosition,
	filterSidebarPosition,
	sendDrawerPositionApp,
}) => {
	useEffect(() => {
		if (sendDrawerPositionApp) {
			window.core.SendDrawerPosition(
				JSON.stringify({
					filterSidebar: filterSidebarPosition.values,
					commentsSidebar: commentsPosition.values,
				})
			)
			// setSendDrawerPosition(false)
		}
	}, [commentsPosition, filterSidebarPosition, sendDrawerPositionApp])
	return { isDrawerSent: true }
}
