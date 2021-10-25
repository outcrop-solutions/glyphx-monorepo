import React, { useState } from 'react'
import { Auth } from 'aws-amplify'

function ResetPassword({ setResetPass, setSignUp }) {
	const [email, setEmail] = useState('')
	const handleEmail = (e) => {
		setEmail(e.target.value)
	}
	const handleResetPassword = async () => {
		try {
			const result = await Auth.forgotPassword(email)
			console.log({ result })
		} catch (error) {
			console.log({ error })
		}
	}

	const handleBack = () => {
		setResetPass(false)
		setSignUp(false)
	}

	return (
		<main className='bg-gray-900'>
			<div className='relative md:flex'>
				{/* Content */}
				<div className='w-full'>
					<div className='max-w-sm mx-auto min-h-screen flex flex-col justify-center px-4 py-8'>
						<div className='w-full rounded-md p-8 bg-gray-800'>
							<h1 className='text-xl text-white font-bold mb-6'>
								Reset your Password
							</h1>
							{/* Form */}
							<div>
								<div className='space-y-4'>
									<div>
										<label
											className='block text-sm text-white font-medium mb-1'
											htmlFor='email'>
											Email Address <span className='text-yellow-500'>*</span>
										</label>
										<input
											id='email'
											value={email}
											onChange={handleEmail}
											className='form-input w-full bg-gray-900 border-gray-400 focus:border-0'
											type='email'
										/>
									</div>
								</div>
								<div className='flex justify-between mt-6'>
									<span
										onClick={handleBack}
										className='text-yellow-400 text-sm cursor-pointer hover:underline'>
										Back to Sign In
									</span>
									<button
										onClick={handleResetPassword}
										className='btn bg-yellow-400 hover:bg-yellow-600 text-gray-900 text-sm font-bold whitespace-nowrap rounded-2xl py-1 '>
										Send Code
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default ResetPassword
