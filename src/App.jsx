import React, { useEffect, useState } from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'

import './css/style.scss'

import { focusHandling } from 'cruip-js-toolkit'

import QWebChannel from 'qwebchannel';

import { Projects } from './pages/Projects'

var socket = null;

import Amplify, { API, graphqlOperation } from 'aws-amplify'
import awsconfig from './aws-exports'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { listProjects } from './graphql/queries'

Amplify.configure(awsconfig)

function App() {
	const [projects, setProjects] = useState([])
	useEffect(() => {
		fetchProjects()
	}, [])
	const fetchProjects = async () => {
		try {
			const projectData = await API.graphql(graphqlOperation(listProjects))
			const projectList = projectData.data.listProjects.items
			setProjects(projectList)
			console.log({ projectData, projectList })
		} catch (error) {
			console.log('error on fetching projects', error)
		}
	}
	// position state can be destructured as follows...
	// { bottom, height, left, right, top, width, x, y } = position
	const [position, setPosition] = useState({})
	const [sendDrawerPosition, setSendDrawerPosition] = useState(false)
	const location = useLocation()

	useEffect(() => {
		document.querySelector('html').style.scrollBehavior = 'auto'
		window.scroll({ top: 0 })
		document.querySelector('html').style.scrollBehavior = ''
		focusHandling('outline')

		var baseUrl = "ws://localhost:12345";
    	openSocket(baseUrl);

	}, [location.pathname]) // triggered on route change

	useEffect(() => {
		if(sendDrawerPosition){
			window.core.SendDrawerPosition(JSON.stringify(position));
			setSendDrawerPosition(false);
		}
	}, [position, sendDrawerPosition])

	var openSocket = (baseUrl) => {

		if(!socket) {
		  socket = new WebSocket(baseUrl);
		}
		socket.onclose = function() {
		  console.error("web channel closed");
		};
		socket.onerror = function(error) {
			console.error("web channel error: " + error);
		};
		socket.onopen = function() {
			console.log("WebSocket connected, setting up QWebChannel.");
			new QWebChannel.QWebChannel(socket, function(channel) {
				try {
					// make core object accessible globally
					window.core = channel.objects.core;
		
					window.core.KeepAlive.connect(function(message) {
						//Issued every 30 seconds from Qt to prevent websocket timeout
						console.log(message);
					});
		
					window.core.GetDrawerPosition.connect(function(message) {
						setSendDrawerPosition(true);
					});
		
					
					//core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
					//core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
					//core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
					//core.ChangeState("Change State");		// Takes the Json information for the selected state
					//core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
		
				}
				catch (e){
					console.error(e.message);
				}
			});
		}
	}

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
