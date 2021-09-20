import React, { useEffect, useState } from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'

import './css/style.scss'

import { focusHandling } from 'cruip-js-toolkit'

import { Projects } from './pages/Projects'

import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
import { withAuthenticator } from '@aws-amplify/ui-react'

Amplify.configure(awsconfig)
function App() {
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
					<Projects position={position} setPosition={setPosition} />
				</Route>
			</Switch>
		</>
	)
}

export default withAuthenticator(App)
