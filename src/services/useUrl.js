import { useEffect } from 'react'
import { Storage } from 'aws-amplify'

export const useUrl = (project) => {
	//pass presigned url
	useEffect(() => {
		const signUrl = async () => {
			try {
				// TODO: put unzipped file names in sidebar.json
				let signedUrl = await Storage.get('mcgee_sku_model.zip')
				if (project && window.core) {
					window.core.OpenProject(JSON.stringify(signedUrl))
				}
			} catch (error) {
				console.log({ error })
			}
		}
		signUrl()
	}, [project])

	return { isUrlSigned: true }
}
