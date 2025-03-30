function adminLogin() {
	const emailText = document.getElementById('admin-email')
	const passwordText = document.getElementById('admin-password')

	const loginLockDiv = document.getElementsByClassName('login-lock-div')[0]
	const loginSpinner = document.getElementsByClassName('spinner-parent-div')[0]

	loginLockDiv.style.setProperty('display', 'none', 'important')
	loginSpinner.style.setProperty('display', 'flex', 'important')

	const loginData = {
		email: emailText.value,
		password: passwordText.value,
	}

	fetch(`${BACKEND_URL}/admin`, {
		method: 'POST',
		body: JSON.stringify(loginData),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			if (data.error) {
				showNotification('ERROR', 'Admin credentials invalid !')
				loginLockDiv.style.setProperty('display', 'flex', 'important')
				loginSpinner.style.setProperty('display', 'none', 'important')
				return
			}

			const now = new Date() // Get current date and time
			now.setMinutes(now.getMinutes() + 30) // Add 30 minutes

			adminSession = {
				msg: 'Logged In',
				expires_at: now.toISOString(),
			}

			localStorage.setItem('admin', JSON.stringify(adminSession))
			localStorage.setItem('admin-logged-in', data.message)
			window.location.replace('/pages/admin-profile.html?section=Receivers&type=NewRequests')
		})
		.catch((err) => {
			showNotification('ERROR', 'Server closed! Please check server.')
			loginLockDiv.style.setProperty('display', 'flex', 'important')
			loginSpinner.style.setProperty('display', 'none', 'important')
		})
}
