import { Auth } from 'aws-amplify'
import { useEffect, useState } from 'react'

export const useUser = (isLoggedin, isSignedUp) => {
	const [user, setUser] = useState({})
	// check if user is logged in
	useEffect(() => {
		// utility functions
		const assessLoggedIn = () => {
			Auth.currentAuthenticatedUser()
				.then(() => {
					setIsLoggedIn(true)
				})
				.catch(() => {
					setIsLoggedIn(false)
					// history.push('/signin')
				})
		}
		const getUser = async () => {
			try {
				let user = await Auth.currentUserInfo()
				setUser(user)
			} catch (error) {
				setIsLoggedIn(false)
			}
		}
		getUser()
		assessLoggedIn()
	}, [])
	return { user, isLoggedIn }
}
