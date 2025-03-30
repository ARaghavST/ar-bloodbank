var lastDonatedDate = ''

//#region Page Load functions

window.onload = function () {
	// notification implementation for donor-login

	const localStorageDonorData = localStorage.getItem('donor')

	if (localStorageDonorData) {
		const donateNowButton = document.getElementsByClassName('donate-now-button')[0]
		const localStorageParsedDonorData = JSON.parse(localStorageDonorData)

		if (localStorageParsedDonorData.status === 2) {
			donateNowButton.children[0].classList.add('disabled-donate-now-button')
		}
	}

	if (localStorage.getItem('logged_now')) {
		showNotification('SUCCESS', localStorage.getItem('logged_now'))
		localStorage.removeItem('logged_now')
	}

	// notification implementation for emergency and availability update
	if (localStorage.getItem('update')) {
		showNotification('INFO', localStorage.getItem('update'))
		localStorage.removeItem('update')
	}

	const body = document.getElementsByTagName('body')[0]
	const dialogBox = document.getElementsByClassName('profile-dialog-box')[0]

	body.addEventListener('click', (event) => {
		if (event.target.className == 'profile-button' || event.target.className == 'fas fa-user') {
			if (dialogBox.style.display === 'flex') {
				dialogBox.style.display = 'none'
				return
			}

			dialogBox.style.display = 'flex'
		} else {
			dialogBox.style.display = 'none'
		}
	})

	displayDonorData()
}

//#endregion

//#region Donor history logic
function displayDonorData() {
	var donor = localStorage.getItem('donor')

	if (donor) {
		donorObj = JSON.parse(donor)

		const expiryTime = new Date(donorObj.expires_at)
		const currentTime = new Date()

		if (currentTime.getTime() > expiryTime.getTime()) {
			window.location.replace('/pages/donor-login.html')
			localStorage.removeItem('donor')

			window.alert('Session expired! Login again')

			return
		}

		const donorData = donorObj

		const nameLabel = document.getElementById('donor-profile-name')
		const availabilityStringLabel = document.getElementById('donor-profile-availability')
		const availabilityToggle = document.getElementById('availability-toggle')
		const emergencyToggle = document.getElementById('emergency-toggle')

		const dateInput = document.getElementById('available-date-input')

		nameLabel.innerHTML = donorData.name

		if (donorData.availability === 'NO') {
			availabilityStringLabel.innerHTML = 'Your gift of blood can save lives. Keep your availability enabled and make a difference!'
			availabilityToggle.checked = false
		} else {
			availabilityStringLabel.innerHTML = "Your 'Yes' to our bloodbank gives others a second chance in life. Keep up the good work"
			availabilityToggle.checked = true
		}

		if (donorData.e_ready == 0) {
			emergencyToggle.checked = false
		} else {
			emergencyToggle.checked = true
		}

		const today = new Date()
		const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10) // 7 days ahead

		dateInput.min = today.toISOString().split('T')[0]
		dateInput.max = maxDate.toISOString().split('T')[0]

		fetchAndDisplayDonationHistory()
	} else {
		window.location.replace('/pages/donor-login.html')
	}
}

//#endregion

//#region Dialog Box close
function closeDialogBox() {
	const dialogBox = document.getElementsByClassName('overlay')[0]
	dialogBox.style.display = 'none'

	const toUpdateFieldElement = document.getElementById('status-update-field-name')

	if (toUpdateFieldElement.innerHTML === '') {
		return
	}

	if (toUpdateFieldElement.innerHTML == 'AVAILABILITY') {
		document.getElementById('availability-toggle').checked = false
	} else {
		document.getElementById('emergency-toggle').checked = false
	}
}

//#endregion

//#region Check logged-in timeout
function checkLoggedDonorTimeout() {
	var donor = localStorage.getItem('donor')

	if (donor) {
		donorObj = JSON.parse(donor)

		const expiryTime = new Date(donorObj.expires_at)
		const currentTime = new Date()

		if (currentTime.getTime() > expiryTime.getTime()) {
			window.location.replace('/pages/donor-login.html')
			localStorage.removeItem('donor')

			window.alert('Session expired! Login again')

			return true
		}
	}

	return false
}

//#endregion

//#region Toggle Avail Check
function toggleAvailability(checkbox) {
	if (checkLoggedDonorTimeout()) {
		return
	}

	const toStatusUpdateDialogBox = document.getElementsByClassName('update-status-dialog-box')[0]
	const updatePasswordDiv = document.getElementsByClassName('password-update-box')[0]
	const donationRequestDiv = document.getElementsByClassName('donate-now-box')[0]
	const toUpdateFieldElement = document.getElementById('status-update-field-name')
	const dialogBox = document.getElementsByClassName('overlay')[0]

	if (checkbox.checked) {
		updatePasswordDiv.style.display = 'none'
		donationRequestDiv.style.display = 'none'

		toStatusUpdateDialogBox.style.display = 'flex'
		toUpdateFieldElement.innerHTML = 'AVAILABILITY'
		dialogBox.style.display = 'flex'
	} else {
		setUnavailableStatus('AVAILABILITY')
	}
}

function toggleEmergency(checkbox) {
	if (checkLoggedDonorTimeout()) {
		return
	}

	const updatePasswordDiv = document.getElementsByClassName('password-update-box')[0]
	const donationRequestDiv = document.getElementsByClassName('donate-now-box')[0]
	const toUpdateFieldElement = document.getElementById('status-update-field-name')

	if (checkbox.checked) {
		updatePasswordDiv.style.display = 'none'
		donationRequestDiv.style.display = 'none'
		const dialogBox = document.getElementsByClassName('overlay')[0]
		toUpdateFieldElement.innerHTML = 'EMERGENCY AVAILABILITY'
		dialogBox.style.display = 'flex'
	} else {
		setUnavailableStatus('EMERGENCY')
	}
}

//#endregion

//#region UpdateAvai/Emer Status
function updateYesStatusSpinner() {
	const dialogBox = document.getElementsByClassName('update-status-dialog-box')[0]
	const spinnerBox = document.getElementsByClassName('spinner-parent-div')[0]
	const overlay = document.getElementsByClassName('overlay')[0]

	const toUpdateFieldElement = document.getElementById('status-update-field-name')

	dialogBox.style.display = 'none'
	spinnerBox.style.display = 'flex'

	var donor = localStorage.getItem('donor')
	donorObj = JSON.parse(donor)

	var updateBody = {}

	if (toUpdateFieldElement.innerHTML == 'AVAILABILITY') {
		updateBody = {
			availability: 'YES',
		}
	} else {
		updateBody = {
			e_ready: '1',
		}
	}

	fetch(`${BACKEND_URL}/donor/?id=${donorObj.id}`, {
		method: 'PUT',
		body: JSON.stringify(updateBody),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			overlay.style.display = 'none'

			if (toUpdateFieldElement.innerHTML == 'AVAILABILITY') {
				donorObj['availability'] = 'YES'
			} else {
				donorObj['e_ready'] = 1
			}

			localStorage.setItem('update', `${toUpdateFieldElement.innerHTML} updated!`)
			localStorage.setItem('donor', JSON.stringify(donorObj))

			window.location.reload(true)
		})
		.catch((err) => {
			overlay.style.display = 'none'
			showNotification('ERROR', 'Server closed! Please check server.')
		})
}
//#endregion

//#region SetUnAvail Status
function setUnavailableStatus(toUpdateValue) {
	var toUpdateBody = {}

	if (toUpdateValue === 'AVAILABILITY') {
		toUpdateBody = {
			availability: 'NO',
		}
	} else {
		toUpdateBody = {
			e_ready: '0',
		}
	}

	fetch(`${BACKEND_URL}/donor/?id=${donorObj.id}`, {
		method: 'PUT',
		body: JSON.stringify(toUpdateBody),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			if (toUpdateValue == 'AVAILABILITY') {
				donorObj['availability'] = 'NO'
			} else {
				donorObj['e_ready'] = 0
			}

			localStorage.setItem('update', `${toUpdateValue} updated!`)
			localStorage.setItem('donor', JSON.stringify(donorObj))

			window.location.reload(true)
		})
		.catch((err) => {
			showNotification('ERROR', 'Server closed! Please check server.')
		})
}
//#endregion

//#region DonationHistory
function fetchAndDisplayDonationHistory() {
	const historyItemsContainer = document.getElementById('donation-history-items')
	const historyContainerLoader = document.getElementById('history-items-loader')
	const noHistoryFoundLabel = document.getElementById('no-records-found-label')

	const donateNowButtonParent = document.getElementsByClassName('donate-now-button')[0]
	const handHoldingMedicalIcon = document.getElementsByClassName(' fa-hand-holding-medical')[0]
	const donateNowClockIcon = document.getElementsByClassName('fa-clock')[0]

	donateNowClockIcon.style.display = 'none'
	const donateNowButton = donateNowButtonParent.children[0]

	fetch(`${BACKEND_URL}/donor/?id=${donorObj.id}`)
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			historyContainerLoader.style.display = 'none'

			if (data.data.length === 0) {
				noHistoryFoundLabel.style.display = 'block'
				return
			}

			lastDonatedDate = data.data[0]['donation_time']

			for (var i = 0; i < data.data.length; i++) {
				const item = data.data[i]

				const timeString = item.donation_time

				let formattedDate = ''
				let formattedTime = ''

				if (timeString) {
					// These lines make date from 2025-03-17 to 17 March 2025
					const dateObject = new Date(timeString.split(' ')[0])

					// Define options for formatting
					const options = { day: '2-digit', month: 'long', year: 'numeric' }

					// Create an Intl.DateTimeFormat object with the desired locale and options
					const formatter = new Intl.DateTimeFormat('en-GB', options)

					// Format the date
					formattedDate = formatter.format(dateObject)

					// These functions make time from 13:00:00 to 01:00 PM

					let [hours, minutes, seconds] = timeString.split(' ')[1].split(':').map(Number)

					// Determine AM or PM suffix
					const period = hours >= 12 ? 'PM' : 'AM'

					// Convert hours from 24-hour to 12-hour format
					hours = hours % 12 || 12 // Converts '0' or '12' to '12'

					// Format minutes to always be two digits
					minutes = minutes.toString().padStart(2, '0')

					// Return formatted time without seconds
					formattedTime = `${hours}:${minutes} ${period}`
				}

				historyItemsContainer.innerHTML += `
	            <div class="history-card">
	            <div class="blood-icon">🩸</div>
	            <div class="history-details">
	              <p class="info">🗓️ <span>Date:</span> ${formattedDate}</p>
	              <p class="info">⏰ <span>Time:</span> ${formattedTime}</p>
	              <p class="info">💉 <span>Amount Donated:</span> ${item.quantity} mL</p>
	              <p class="info">⚖️ <span>Weight:</span> ${item.weight} kg</p>
	            </div>
	            </div>`
			}

			if (!IsDonationAllowed()) {
				donateNowButton.classList.add('disabled-donate-now-button')
				donateNowClockIcon.style.display = 'block'
				handHoldingMedicalIcon.style.display = 'none'
			}
		})
		.catch((err) => {
			noHistoryFoundLabel.style.display = 'block'
			showNotification('ERROR', 'Server closed! Please check server.')
		})
}
//#endregion

//#region UpdatePassDialogBox
function showUpdatePasswordDialogBox() {
	const updateStatusDiv = document.getElementsByClassName('status-update-box')[0]
	const updatePasswordDiv = document.getElementsByClassName('password-update-box')[0]
	const donationRequestDiv = document.getElementsByClassName('donate-now-box')[0]

	const dialogBox = document.getElementsByClassName('overlay')[0]
	dialogBox.style.display = 'flex'

	donationRequestDiv.style.display = 'none'
	updatePasswordDiv.style.display = 'flex'
	updateStatusDiv.style.display = 'none'
}
//#endregion

//#region ChangePassword
function changePassword() {
	const newPassword = document.getElementById('new-password-input').value

	var toUpdateBody = {
		password: newPassword,
	}

	fetch(`${BACKEND_URL}/donor/?id=${donorObj.id}`, {
		method: 'PUT',
		body: JSON.stringify(toUpdateBody),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			showNotification('WARNING', 'Password updated successfully !')
			document.getElementById('new-password-input').value = ''
			closeDialogBox()
		})
		.catch((err) => {
			document.getElementById('new-password-input').value = ''
			closeDialogBox()
			showNotification('ERROR', 'Server closed! Please check server.')
		})
}
//#endregion

function logoutDonorProfile() {
	localStorage.setItem('logged_out', 'Logged out successfully!')
	localStorage.removeItem('donor')

	window.location.replace('/pages/donor-login.html')
}

//#region DonationConfDialog
function openDonationConfirmationDialog() {
	if (IsDonationRequested()) {
		window.alert('You have just requested for blood donation!')
		return
	}

	if (!IsDonationAllowed()) {
		const date = new Date(lastDonatedDate)
		date.setDate(date.getDate() + 91)
		const nextDonationDate = date.toISOString().replace('T', ' ').split(' ')[0]
		showNotification('WARNING', `You have donated blood recently! Now you can donate after ${nextDonationDate}`)
		return
	}

	const dialogBoxParent = document.getElementsByClassName('update-status-dialog-box')[0]
	const updateStatusDiv = document.getElementsByClassName('status-update-box')[0]

	const updatePasswordDiv = document.getElementsByClassName('password-update-box')[0]
	const donationDiv = document.getElementsByClassName('donate-now-box')[0]

	const overlay = document.getElementsByClassName('overlay')[0]
	overlay.style.display = 'flex'

	dialogBoxParent.style.display = 'flex'
	updatePasswordDiv.style.display = 'none'
	updateStatusDiv.style.display = 'none'
	donationDiv.style.display = 'block'
}
//#endregion

function getCurrentTime() {
	const now = new Date()
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	return `${hours}:${minutes}:${seconds}`
}

//#region IsDonationReq Already ?
function IsDonationRequested() {
	const localStorageDonorData = localStorage.getItem('donor')

	if (localStorageDonorData) {
		const donateNowButton = document.getElementsByClassName('donate-now-button')[0]
		const localStorageParsedDonorData = JSON.parse(localStorageDonorData)

		if (localStorageParsedDonorData.status === 2) {
			return true
		}
	}
	return false
}
//#endregion

//#region DonationAllowed ?
function IsDonationAllowed() {
	//2024-04-03T12:00:00Z is lastDonatedTZString

	// if lastDonatedDate is empty OR NULL OR undefined i.e. when a new donor log-in
	if (!lastDonatedDate) {
		return true
	}
	const lastDonatedTZString = `${lastDonatedDate.split(' ')[0]}T${lastDonatedDate.split(' ')[1]}Z`
	const lastDonatedTimeStamp = Math.floor(new Date(lastDonatedTZString).getTime() / 1000)

	const currentTimestamp = Math.floor(Date.now() / 1000)
	return lastDonatedTimeStamp + 90 * 24 * 60 * 60 < currentTimestamp
}
//#endregion

//#region DonateReq Logic
function submitBloodDonationRequest() {
	var donor = localStorage.getItem('donor')
	var donorObj = JSON.parse(donor)

	const dateInput = document.getElementById('available-date-input')
	const donateNow = document.getElementsByClassName('update-status-dialog-box')[0]

	const spinnerDiv = document.getElementsByClassName('spinner-parent-div')[0]
	const overlay = document.getElementsByClassName('overlay')[0]

	if (!dateInput.value) {
		// notification
		window.alert('You need to select date')
		return
	}
	donateNow.style.display = 'none'
	spinnerDiv.style.display = 'flex'

	fetch(`${BACKEND_URL}/donor/donate?id=${donorObj.id}`, {
		method: 'POST',
		body: JSON.stringify({
			blood_group: donorObj.blood_group,
			available_date: dateInput.value + ' ' + getCurrentTime(),
		}),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			showNotification('SUCCESS', 'Donation request submitted !')

			dateInput.input = ''
			spinnerDiv.style.display = 'none'
			overlay.style.display = 'none'
		})
		.catch((err) => {
			showNotification('ERROR', 'Server closed! Please check server.')

			dateInput.input = ''
			spinnerDiv.style.display = 'none'
			overlay.style.display = 'none'
		})
}
//#endregion
