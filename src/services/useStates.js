import { useState, useEffect } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { listStates } from '../graphql/queries'

export const useStates = () => {
	const [state, setState] = useState(null)
	const [states, setStates] = useState([])
	const fetchStates = async () => {
		try {
			const stateData = await API.graphql(graphqlOperation(listStates))
			const stateList = stateData.data.listStates.items

			console.log({ stateList })
			setState(stateList[0])
			setStates((prev) => {
				let newData = [...stateList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching states', error)
		}
	}
	useEffect(() => {
		fetchStates()
	}, [])
	return { states, state }
}
