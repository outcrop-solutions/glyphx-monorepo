import { Auth } from 'aws-amplify'
import { useEffect, useState } from 'react'

export const useUser = (isLoggedin) => {
	const [user, setUser] = useState({})
	const [isLogged, setIsLogged] = useState(false)
	// check if user is logged in
	useEffect(() => {
		// utility functions
		const assessLoggedIn = () => {
			Auth.currentAuthenticatedUser()
				.then(() => {
					setIsLogged(true)
				})
				.catch(() => {
					setIsLogged(false)
					// history.push('/signin')
				})
		}
		const getUser = async () => {
			try {
				let user = await Auth.currentUserInfo()
				setUser(user)
			} catch (error) {
				setIsLogged(false)
			}
		}
		getUser()
		assessLoggedIn()
	}, [isLoggedin])
	return { user, isLogged }
}
