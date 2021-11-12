import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Storage } from 'aws-amplify'

export const Dropzone = ({ setFiles }) => {
	const onDrop = useCallback((acceptedFiles) => {
		console.log({ acceptedFiles })
		setFiles((prev) => {
			let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
				id: idx + prev.length + 1,
				parent: 1,
				droppable: false,
				text: name,
				data: {
					fileType: type,
					fileSize: size,
				},
			}))
			let newFiles = [...prev, ...newData]
			console.log({ newFiles })
			return newFiles
		})
		acceptedFiles.forEach((file, idx) => {
			const reader = new FileReader()

			reader.onabort = () => console.log('file reading was aborted')
			reader.onerror = () => console.log('file reading has failed')
			reader.onload = () => {
				// Do whatever you want with the file contents
				const binaryStr = reader.result
				Storage.put(file.name, binaryStr, {
					progressCallback(progress) {
						console.log(`Uploaded: ${progress.loaded}/${progress.total}`)
					},
				})
				console.log(`sent ${file.name} to S3`)
			}
			reader.readAsArrayBuffer(file)
		})

		// add to filesystem state
		// upload files to S3
	}, [])
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

	return (
		<div
			className={`px-4 py-2 mr-3 ${
				isDragActive ? 'border border-white py-0 px-0 h-48' : ''
			} rounded-lg`}
			{...getRootProps()}>
			<input {...getInputProps()} />
			{isDragActive ? (
				<div className='text-gray-500 hover:text-gray-300 cursor-pointer'>
					Drop the files here ...
				</div>
			) : (
				<div className='text-xs cursor-pointer'>
					<span className='text-gray-500 hover:text-gray-300 '>+ Files...</span>
				</div>
			)}
		</div>
	)
}
