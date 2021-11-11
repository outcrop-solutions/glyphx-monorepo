import { useState, useEffect } from 'react'
import { Storage } from 'aws-amplify'

export const useFileSystem = (project) => {
	const [fileSystem, setFileSystem] = useState([
		{
			id: 1,
			parent: 0,
			droppable: true,
			text: 'Sample_Project',
		},
		{
			id: 2,
			parent: 1,
			droppable: false,
			text: 'sidebar.json',
			data: {
				fileType: 'json',
				fileSize: '0.5MB',
			},
		},
		{
			id: 3,
			parent: 1,
			droppable: false,
			text: 'mcgee_sku_model.zip',
			data: {
				fileType: 'zip',
				fileSize: '0.5MB',
			},
		},
	])
	// utility to process storage list if unzipped
	function processStorageList(results) {
		const filesystem = {}

		const add = (source, target, item) => {
			const elements = source.split('/')
			const element = elements.shift()
			if (!element) return // blank
			target[element] = target[element] || { __data: item } // element;
			if (elements.length) {
				target[element] =
					typeof target[element] === 'object' ? target[element] : {}
				add(elements.join('/'), target[element], item)
			}
		}
		results.forEach((item) => add(item.key, filesystem, item))
		return filesystem
	}

	useEffect(() => {
		const getFileSystem = async () => {
			try {
				let sidebarData = await Storage.get('sidebar.json', {
					download: true,
				})
				// data.Body is a Blob
				sidebarData.Body.text().then((string) => {
					let { files } = JSON.parse(string)

					setFileSystem((prev) => {
						let newData = files.map((item, idx) => ({
							id: idx + 2,
							parent: 1,
							droppable: false,
							text: item,
							data: {
								fileType: item.split('.')[1],
								fileSize: '0.5MB',
							},
						}))
						newData.unshift({
							id: 1,
							parent: 0,
							droppable: true,
							text: 'Sample_Project',
						})
						return newData
					})
				})
			} catch (error) {
				console.log({ error })
			}
		}
		getFileSystem()
	}, [project])

	return { fileSystem }
}
