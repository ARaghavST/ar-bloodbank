window.onload = function () {
	if (localStorage.getItem('logged_out')) {
		showNotification('SUCCESS', localStorage.getItem('logged_out'))
		localStorage.removeItem('logged_out')
	}
}

async function userLogin() {
	const emailField = document.getElementById('email')
	const passwordField = document.getElementById('password')
	/* Like Dictionaries in Python
     Used for data protection */
	const data = {
		email: emailField.value,
		password: passwordField.value,
	}

	const loginLockDiv = document.getElementsByClassName('login-lock-div')[0]
	const loginSpinner = document.getElementsByClassName('spinner-parent-div')[0]

	loginLockDiv.style.setProperty('display', 'none', 'important')
	loginSpinner.style.setProperty('display', 'flex', 'important')

	fetch(`${BACKEND_URL}/donor/login`, {
		method: 'POST',
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			if (data.error) {
				loginLockDiv.style.setProperty('display', 'flex', 'important')
				loginSpinner.style.setProperty('display', 'none', 'important')

				showNotification('ERROR', data.error)
			} else {
				const toSetDonorObject = data.data.data

				const now = new Date() // Get current date and time
				now.setMinutes(now.getMinutes() + 30) // Add 10 minutes

				toSetDonorObject['expires_at'] = now.toISOString()

				localStorage.setItem('donor', JSON.stringify(toSetDonorObject))
				localStorage.setItem('logged_now', data.message)

				window.location.href = '/pages/donor-profile.html'
			}
		})
		.catch((err) => {
			showNotification('ERROR', 'Server closed! Please check server.')
			loginLockDiv.style.setProperty('display', 'flex', 'important')
			loginSpinner.style.setProperty('display', 'none', 'important')
		})
}
