import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Auth } from 'aws-amplify'

import AuthImage from '../images/auth-image.jpg'
import AuthDecoration from '../images/auth-decoration.png'

function Signin({ setUser, setLoggedIn, setSignUp, setResetPass }) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const handleUname = (e) => {
		setUsername(e.target.value)
	}
	const handleResetPass = () => {
		setResetPass(true)
		setUsername('')
		setPassword('')
	}

	const handlePass = (e) => {
		setPassword(e.target.value)
	}
	const signIn = async () => {
		try {
			const user = await Auth.signIn(username, password)
			console.log({ user })
			setUser(user)
			setLoggedIn(true)
		} catch (error) {
			console.log('error on signin page' + error)
			setLoggedIn(false)
		}
	}
	return (
		<main className='bg-gray-900'>
			<div className='relative md:flex'>
				{/* Content */}
				<div className='w-full'>
					<div className='max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8'>
						<div className='w-full rounded-md p-8 bg-gray-800 border-gray-400 border'>
							<h1 className='text-xl text-white font-bold mb-6'>
								Sign in to your account
							</h1>
							{/* Form */}
							<div>
								<div className='space-y-4'>
									<div>
										<label
											className='block text-sm font-medium mb-1 text-white'
											htmlFor='email'>
											Email Address
										</label>
										<input
											id='email'
											value={username}
											onChange={handleUname}
											className='form-input w-full bg-gray-900 border-gray-400 text-white focus:border-0'
											type='email'
										/>
									</div>
									<div>
										<label
											className='block text-sm font-medium mb-1 text-white'
											htmlFor='password'>
											Password
										</label>
										<input
											value={password}
											onChange={handlePass}
											id='password'
											className='form-input w-full bg-gray-900 border-gray-400 focus:border-opacity-0 focus:ring-transparent text-white'
											type='password'
											autoComplete='on'
										/>
									</div>
								</div>
								<div className='flex items-center justify-between mt-6'>
									<div className='mr-1'>
										<div
											onClick={handleResetPass}
											className='text-sm underline hover:no-underline text-gray-400'>
											Forgot Password?
										</div>
									</div>
									<Link
										onClick={signIn}
										onKeyPress={(ev) => {
											if (ev.key === 'Enter') {
												ev.preventDefault()
												signIn()
											}
										}}
										className='btn bg-yellow-400 select-none cursor-pointer rounded-2xl py-1 hover:bg-yellow-600 text-gray-900 ml-3'
										to='/'>
										Sign In
									</Link>
								</div>
							</div>
							{/* Footer */}
							<div className='pt-5 mt-6 border-t border-gray-200'>
								<div className='text-sm text-gray-400'>
									Don’t you have an account?{' '}
									<span
										onClick={() => setSignUp(true)}
										className='font-medium select-none text-yellow-400 cursor-pointer hover:text-yellow-300'>
										Sign Up
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default Signin
