import React, { useEffect, useState } from 'react'
import {
	Switch,
	Route,
	useLocation,
	useHistory,
	Router,
	Redirect,
} from 'react-router-dom'

import './css/style.scss'

import { focusHandling } from 'cruip-js-toolkit'

import { Projects } from './pages/Projects'
import SignIn from './pages/Signin'

import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'

import awsconfig from './aws-exports'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { listProjects } from './graphql/queries'

import posthog from 'posthog-js'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'

posthog.init('phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS', {
	api_host: 'https://app.posthog.com',
})

Amplify.configure(awsconfig)

function App() {
	let history = useHistory()
	const [projects, setProjects] = useState([])
	const [user, setUser] = useState({})
	const [loggedIn, setLoggedIn] = useState(false)
	const [signUp, setSignUp] = useState(false)
	const [resetPass, setResetPass] = useState(false)

	useEffect(() => {
		assessLoggedIn()
	}, [])

	const assessLoggedIn = () => {
		Auth.currentAuthenticatedUser()
			.then(() => {
				setLoggedIn(true)
			})
			.catch(() => {
				setLoggedIn(false)
				// history.push('/signin')
			})
	}

	useEffect(() => {
		const getUser = async () => {
			try {
				let user = await Auth.currentUserInfo()
				setUser(user)
			} catch (error) {
				setLoggedIn(false)
			}
		}
		getUser()
	}, [])

	useEffect(() => {
		posthog.capture('my event', { property: 'value' })
		fetchProjects()
	}, [])

	const fetchProjects = async () => {
		try {
			const projectData = await API.graphql(graphqlOperation(listProjects))
			const projectList = projectData.data.listProjects.items

			setProjects((prev) => {
				let newData = [...projectList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching projects', error)
		}
	}
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
					{loggedIn && user ? (
						<Projects
							setLoggedIn={setLoggedIn}
							user={user}
							projects={projects}
							position={position}
							setPosition={setPosition}
						/>
					) : resetPass ? (
						<ResetPassword setResetPass={setResetPass} setSignUp={setSignUp} />
					) : signUp ? (
						<Signup
							setUser={setUser}
							setSignUp={setSignUp}
							setLoggedIn={setLoggedIn}
						/>
					) : (
						<SignIn
							setResetPass={setResetPass}
							setUser={setUser}
							setLoggedIn={setLoggedIn}
							setSignUp={setSignUp}
						/>
					)}
				</Route>
				{/* <Route exact path='/signin'>
					<SignIn />
				</Route> */}
			</Switch>
		</>
	)
}

// export default withAuthenticator(App)
export default App
