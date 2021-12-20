import { useEffect } from 'react'

export const useStateChange = (state) => {
	//build query string and call state change function
	useEffect(() => {
		if (window && window.core && state) {
			//build array of query strings
			if (typeof state.filters !== 'undefined') {
				let filterStringArr = []

				for (let i = 0; i < state.filters.length; i++) {
					let filter = state.filters[i]
					let cols = filter.columns
					for (let j = 0; j < cols.length; j++) {
						let name = cols[j].name
						let min = cols[j].min
						let max = cols[j].max

						let queryStr = `${name || '-'} BETWEEN ${min || '-'} AND ${
							max || '-'
						}`
						filterStringArr.push(queryStr)
					}
				}
				let query =
					filterStringArr.length > 0
						? `SELECT rowid from \`0bc27e1c-b48b-474e-844d-4ec1b0f94613\` WHERE ${filterStringArr.join(
								" AND "
						  )}`
						: ''
				const changeStateInput = {
					camera: state.camera,
					filter: query,
				}
				console.log({ changeStateInput })
				window.core.ChangeState(JSON.stringify(changeStateInput))
			}
		}
	}, [state])
	return { isStateChanged: true }
}
