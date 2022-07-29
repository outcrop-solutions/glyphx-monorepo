import { useState, useEffect } from 'react'
import { Storage } from 'aws-amplify'

/**
 * To handle Column titles from CSV data, to be stored as "Properties"
 * @param {boolean} isSelected
 * @returns {Object}
 */
export const useColumns = (project) => {
	const [columns, setColumns] = useState([])
	useEffect(() => {
		const getColumns = async () => {
			try {
				let sidebarData = await Storage.get('sidebar.json', {
					download: true,
				})
				// data.Body is a Blob
				sidebarData.Body.text().then((string) => {
					let { columns } = JSON.parse(string)
					setColumns([...columns])
				})
			} catch (error) {
				console.log({ error })
			}
		}
		getColumns()
	}, [project])
	return { columns }
}
