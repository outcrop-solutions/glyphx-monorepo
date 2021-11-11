import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import QWebChannel from 'qwebchannel'

export const useSocket = (base) => {
	const [isSocketOpen, setIsSocketOpen] = useState(false)
	const [sendDrawerPosition, setSendDrawerPosition] = useState(false)
	// TODO: return socket status
	let socket
	const location = useLocation()
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
					setIsSocketOpen(true)
					//core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
					//core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
					//core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
					//core.ChangeState("Change State");		// Takes the Json information for the selected state
					//core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
				} catch (e) {
					setIsSocketOpen(false)
					console.error(e.message)
				}
			})
		}
	}
	//open socket connection
	useEffect(() => {
		openSocket(base)
	}, [location.pathname, base])
	return { isSocketOpen, sendDrawerPosition }
}
