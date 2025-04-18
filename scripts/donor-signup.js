//#region Donor Signup logic
// AFT stand for "Apply For Test" in Donor--> SignUp page
function onClickAFT() {
	const spinnerParent = document.getElementsByClassName('spinner-parent-div')[0]
	const submitButton = document.getElementsByClassName('submit-btn')[0]
	const name = document.getElementById('signup-name-text').value
	const dob = document.getElementById('signup-dob-text').value
	const mobile = document.getElementById('signup-mobile-text').value
	const email = document.getElementById('signup-email-text').value

	const gender = document.querySelector('input[name="gender"]:checked')

	var e_available = document.querySelector('input[id="e_check"]:checked') ? 1 : 0

	const listbox = document.getElementById('listbox-bg')

	let bloodGroup

	var listLength = listbox.options.length
	for (var i = 0; i < listLength; i++) {
		// this is for selecting blood group from list box
		if (listbox.options[i].selected) {
			bloodGroup = listbox.options[i].value
		}
	}

	//Regular expression for Date in DOB in Donor-->SignUp Page
	const dateRegx = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
	//Regular expression for Email in DOB in Donor-->SignUp Page
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

	if (!gender) {
		showNotification('ERROR', 'Please choose gender!')
		return
	}

	if (!dateRegx.test(dob)) {
		showNotification('ERROR', 'Invalid date format given!')
		document.getElementById('signup-dob-text').value = ''
		return
	}

	if (!emailRegex.test(email)) {
		showNotification('ERROR', 'Email format invalid!')
		document.getElementById('signup-email-text').value = ''
		return
	}

	// Used for data protection
	const signupData = {
		name: name,
		dob: dob,
		phno: mobile,
		email: email,
		gender: gender.value[0],
		blood_group: bloodGroup,
		e_ready: e_available,
	}

	var emptyFields = []

	Object.entries(signupData).forEach((entry) => {
		if (!entry[1]) {
			entry[0] != 'e_ready' ? emptyFields.push(entry[0].toUpperCase()) : ''
		}
	})

	if (emptyFields.length > 0) {
		window.alert(`${emptyFields.join(',')} cannot be empty !`)
		return
	}

	submitButton.style.display = 'none'
	spinnerParent.style.display = 'flex'

	fetch(`${BACKEND_URL}/donor/`, {
		method: 'POST',
		body: JSON.stringify(signupData),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			submitButton.style.display = 'flex'
			spinnerParent.style.display = 'none'

			if (!data.error) {
				localStorage.setItem('notify-signup', 'Donor signup successful ! You will receive mail for approval.')
				// below line will reload the page, which will run window.onload function | Line-10
				window.location.reload(true)
			} else {
				// if we received error from backend
				// we will empty all input fields
				document.getElementById('signup-name-text').value = ''
				document.getElementById('signup-dob-text').value = ''
				document.getElementById('signup-mobile-text').value = ''
				document.getElementById('signup-email-text').value = ''

				const allCheckBoxes = document.getElementsByName('gender')
				allCheckBoxes.forEach((checkbox) => [(checkbox.checked = false)])
				document.querySelector('input[id="e_check"]').checked = false

				document.getElementById('listbox-bg').options[0].selected = true

				window.alert(data.error)
			}
		})
		.catch((err) => {
			// this the case when backend is not running OR is stopped
			submitButton.style.display = 'flex'
			spinnerParent.style.display = 'none'
			showNotification('ERROR', 'Server closed! Please check server.')
		})

	// This signupdata will be sent to java backend
}
//#endregion
