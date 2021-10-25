import React, { useEffect, useState } from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'

import './css/style.scss'

import { focusHandling } from 'cruip-js-toolkit'

import { Projects } from './pages/Projects'

import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'

import awsconfig from './aws-exports'
import { withAuthenticator } from '@aws-amplify/ui-react'
// import { listProjects } from './graphql/queries'

import posthog from 'posthog-js'

posthog.init('phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS', {
	api_host: 'https://app.posthog.com',
})

Amplify.configure(awsconfig)

function App() {
	const [projects, setProjects] = useState([])
	const [user, setUser] = useState({})
	useEffect(() => {
		const getUser = async () => {
			let user = await Auth.currentUserInfo()
			setUser(user)
		}
		getUser()
	}, [])

	useEffect(() => {
		posthog.capture('my event', { property: 'value' })
		// fetchProjects()
	}, [])

	useEffect(() => {
		console.log({ projects })
	}, [projects])

	// const fetchProjects = async () => {
	// 	try {
	// 		const projectData = await API.graphql(graphqlOperation(listProjects))
	// 		const projectList = projectData.data.listProjects.items

	// 		setProjects((prev) => {
	// 			let newData = [...projectList]
	// 			return newData
	// 		})
	// 	} catch (error) {
	// 		console.log('error on fetching projects', error)
	// 	}
	// }
	// position state can be destructured as follows...
	// { bottom, height, left, right, top, width, x, y } = position
	const [position, setPosition] = useState({})
	const location = useLocation()

	useEffect(() => {
		document.querySelector('html').style.scrollBehavior = 'auto'
		window.scroll({ top: 0 })
		document.querySelector('html').style.scrollBehavior = ''
		focusHandling('outline')
	}, [location.pathname]) // triggered on route change

	return (
		<>
			<Switch>
				<Route exact path='/'>
					<Projects
						user={user}
						projects={projects}
						position={position}
						setPosition={setPosition}
					/>
				</Route>
			</Switch>
		</>
	)
}

export default withAuthenticator(App)
