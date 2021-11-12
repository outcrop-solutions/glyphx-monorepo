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

import awsconfig from './aws-exports'

// styles
import { focusHandling } from 'cruip-js-toolkit'
import './css/style.scss'
import './css/react_spreadsheet_grid_overrides.css'
// components
import { Projects } from './pages/Projects'
import SignIn from './pages/Signin'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import { useSocket } from './services/useSocket'
import { useUser } from './services/useUser'
import { useDrawerPosition } from './services/useDrawerPosition'
import { useProjects } from './services/useProjects'
import Amplify from 'aws-amplify'

// TODO: set api key in environment variable
posthog.init('phc_flrvuYtat2QJ6aSiiWeuBZq69U3M3EmXKVLprmvZPIS', {
	api_host: 'https://app.posthog.com',
})

Amplify.configure(awsconfig)

function App() {
	// const [user, setUser] = useState({})
	const [signup, setSignUp] = useState(false)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const { user, isLogged } = useUser(isLoggedIn)
	const [resetPass, setResetPass] = useState(false)
	const location = useLocation()
	const { projects } = useProjects()
	const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false)
	// comments and filter sidebar positions
	// position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
	//position state dynamically changes with transitions
	const [commentsPosition, setCommentsPosition] = useState({})
	const [filterSidebarPosition, setFilterSidebarPosition] = useState({})
	const { isDrawerSent } = useDrawerPosition(
		commentsPosition,
		filterSidebarPosition,
		sendDrawerPositionApp
	)
	const { isSocketOpen, sendDrawerPosition } = useSocket('ws://localhost:12345')

	useEffect(() => {
		setSendDrawerPositionApp(sendDrawerPosition)
	}, [sendDrawerPosition])
	// handle scroll position on route change
	useEffect(() => {
		document.querySelector('html').style.scrollBehavior = 'auto'
		window.scroll({ top: 0 })
		document.querySelector('html').style.scrollBehavior = ''
		focusHandling('outline')
	}, [location.pathname])

	useEffect(() => {
		setIsLoggedIn(isLogged)
	}, [isLogged])

	return (
		<>
			<Switch>
				<Route exact path='/'>
					{isLoggedIn && user ? (
						<Projects
							user={user}
							setIsLoggedIn={setIsLoggedIn}
							projects={projects}
							commentsPosition={commentsPosition}
							setCommentsPosition={setCommentsPosition}
							filterSidebarPosition={filterSidebarPosition}
							setFilterSidebarPosition={setFilterSidebarPosition}
						/>
					) : resetPass ? (
						<ResetPassword setResetPass={setResetPass} setSignUp={setSignUp} />
					) : signup ? (
						<Signup setSignUp={setSignUp} setIsLoggedIn={setIsLoggedIn} />
					) : (
						<SignIn
							setResetPass={setResetPass}
							setSignUp={setSignUp}
							setIsLoggedIn={setIsLoggedIn}
						/>
					)}
				</Route>
			</Switch>
		</>
	)
}

export default App
