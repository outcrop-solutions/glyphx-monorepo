import React, { useEffect, useState } from 'react'
import {
	Switch,
	Route,
	useLocation,
	useHistory,
	Router,
	Redirect,
} from 'react-router-dom'

// AWS & Analytics
import posthog from 'posthog-js'
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import awsconfig from './aws-exports'

import QWebChannel from 'qwebchannel'

// styles
import { focusHandling } from 'cruip-js-toolkit'
import './css/style.scss'

// components
import { Projects } from './pages/Projects'
import SignIn from './pages/Signin'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import { listProjects } from './graphql/queries'

let socket = null

// TODO: set api key in environment variable
posthog.init('phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS', {
	api_host: 'https://app.posthog.com',
})

Amplify.configure(awsconfig)

function App() {
	const [projects, setProjects] = useState([])
	const [user, setUser] = useState({})
	const [loggedIn, setLoggedIn] = useState(false)
	const [signUp, setSignUp] = useState(false)
	const [resetPass, setResetPass] = useState(false)
	const [position, setPosition] = useState({}) // Drawer position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position

	useEffect(() => {
		console.log({ position })
	}, [position])
	const [sendDrawerPosition, setSendDrawerPosition] = useState(false)

	const location = useLocation()
	useEffect(() => {
		assessLoggedIn()
	}, []) // check if user is logged in
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
	}, []) // fetch and set current user
	useEffect(() => {
		if (user && user.attributes) fetchProjects()
	}, [user]) // fetch project data from RDS
	useEffect(() => {
		document.querySelector('html').style.scrollBehavior = 'auto'
		window.scroll({ top: 0 })
		document.querySelector('html').style.scrollBehavior = ''
		focusHandling('outline')

		var baseUrl = 'ws://localhost:12345'
		openSocket(baseUrl)
	}, [location.pathname]) // handle scroll position on route change
	useEffect(() => {
		if (sendDrawerPosition) {
			window.core.SendDrawerPosition(JSON.stringify(position))
			setSendDrawerPosition(false)
		}
	}, [position, sendDrawerPosition])

	// utility functions
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
	const fetchProjects = async () => {
		try {
			const projectData = await API.graphql(graphqlOperation(listProjects))
			console.log({ projectData })
			const projectList = projectData.data.listProjects.items

			console.log({ projectList })
			setProjects((prev) => {
				let newData = [...projectList]
				return newData
			})
		} catch (error) {
			console.log('error on fetching projects', error)
		}
	}
	let openSocket = (baseUrl) => {
		if (!socket) {
			socket = new WebSocket(baseUrl)
		}
		socket.onclose = function () {
			console.error('web channel closed')
		}
		socket.onerror = function (error) {
			console.error('web channel error: ' + error)
		}
		socket.onopen = function () {
			console.log('WebSocket connected, setting up QWebChannel.')
			new QWebChannel.QWebChannel(socket, function (channel) {
				try {
					// make core object accessible globally
					window.core = channel.objects.core
					window.core.KeepAlive.connect(function (message) {
						//Issued every 30 seconds from Qt to prevent websocket timeout
						console.log(message)
					})
					window.core.GetDrawerPosition.connect(function (message) {
						setSendDrawerPosition(true)
					})

					//core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
					//core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
					//core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
					//core.ChangeState("Change State");		// Takes the Json information for the selected state
					//core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
				} catch (e) {
					console.error(e.message)
				}
			})
		}
	}

	return (
		<>
			<Switch>
				<Route exact path='/'>
					{loggedIn && user ? (
						<Projects
							fetchProjects={fetchProjects}
							setLoggedIn={setLoggedIn}
							user={user}
							projects={projects}
							position={position}
							setPosition={setPosition}
						/>
					) : resetPass ? (
						<ResetPassword
							setResetPass={setResetPass}
							setSignUp={setSignUp}
							setUser={setUser}
						/>
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
			</Switch>
		</>
	)
}

export default App
