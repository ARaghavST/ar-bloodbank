// This backend url is for onrender deployed backend
const BACKEND_URL = 'https://ar-bloodbank-backend.onrender.com/bloodbank-1.0'

// This backend url is the local running backend
// const BACKEND_URL = 'http://localhost:8080/bloodbank'

// onload runs everytime my html page reloads

// this functionality is done to show alert on successful signup
window.onload = function () {
	if (localStorage.getItem('notify-signup')) {
		window.alert(localStorage.getItem('notify-signup'))
		localStorage.removeItem('notify-signup')
	}

	// this will render admin login icon in navigation bar
	renderAdminIcon()
}

// to select only one checkbox between Donor or Receiver
function onlyOne(checkbox) {
	// checkboxes is an array of checkbox , we have two checkbox donor-check and reciever-check
	var checkboxes = document.getElementsByName(checkbox.name)

	checkboxes.forEach((item) => {
		if (item !== checkbox) {
			item.checked = false
		}
	})
}
// Admin login page script

// Submit button at first page
function submitClick() {
	// Accessing Check Boxes through names
	var checkboxes = document.getElementsByName('chk')

	var checkedBox = null

	checkboxes.forEach((item) => {
		if (item.checked) {
			checkedBox = item
		}
	})

	// Checking checked box through ID
	switch (checkedBox.id) {
		case 'chkd':
			window.location.href = '/pages/donor.html'
			break

		case 'chkr':
			window.location.href = '/pages/receiver.html'
			break

		default:
			break
	}
}

//#region Donor.html script
// In Donor page for login
function onLogin() {
	window.location.href = '/pages/donor-login.html'
}
// In Donor page for SignUp
function onSignUp() {
	window.location.href = '/pages/donor-signup.html'
}
//#endregion

//#region Password Eye switch
// Function to show password characters,and to change eye icon to slash and vice versa in Donor-->Login page
function showPassword() {
	const passwordField = document.getElementById('password')
	const togglePassword = document.querySelector('.password-toggle-icon i')
	// "fa-eye" And "fa-eye-slash" icon name or class beside Password text box in Donor-->Login page
	if (passwordField.type === 'password') {
		passwordField.type = 'text'
		togglePassword.classList.remove('fa-eye')
		togglePassword.classList.add('fa-eye-slash')
	} else {
		passwordField.type = 'password'
		togglePassword.classList.remove('fa-eye-slash')
		togglePassword.classList.add('fa-eye')
	}
}
//#endregion

//#region Input !> 10 digits func
// for donor-signup html
// Used to show mobile number every time user enters a number, and to check mobile number do not exeeds 10 digits
const mobileTextBox = document.getElementById('signup-mobile-text')

const receiverPhno = document.getElementById('receiver-phno')

receiverPhno
	? receiverPhno.addEventListener('input', function (event) {
			const mobileNumber = event.target.value

			if (mobileNumber.length > 10) {
				showNotification('WARNING', 'Mobile number cannot exceed 10 digits')
				receiverPhno.value = mobileNumber.substring(0, 10)
			}
	  })
	: ''

mobileTextBox
	? mobileTextBox.addEventListener('input', function (event) {
			const mobileNumber = event.target.value

			if (mobileNumber.length > 10) {
				showNotification('WARNING', 'Mobile number cannot exceed 10 digits')
				mobileTextBox.value = mobileNumber.substring(0, 10)
			}
	  })
	: ''

//#endregion

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
		gender: gender.value,
		blood_group: bloodGroup,
		e_ready: e_available,
	}

	submitButton.style.display = 'none'
	spinnerParent.style.display = 'flex'

	// setTimeout(() => {
	// 	window.alert('Email already in use!')
	// 	submitButton.style.display = 'flex'
	// 	spinnerParent.style.display = 'none'
	// }, 2000)

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

/** Script for receiver.html page load */

/** The HTML code for creation of table is present in script.js line no. 189 - 195 */

//#region Admin icon render
// this function is used to decide on which html page we need to show admin icon in navigation bar
function renderAdminIcon() {
	const adminIcon = document.getElementsByClassName('admin-button')[0]

	path = window.location.pathname

	adminIcon.style.display = path === '/' || path === '/index.html' ? 'block' : ''
}

//#endregion
function goToAdminLogin() {
	window.location.href = '/pages/admin-login.html'
}

/** Script for admin-login page */

//#region Password Eye icon
function showAdminPassword() {
	const passwordField = document.getElementById('admin-password')
	const togglePassword = document.querySelector('.password-toggle-icon i')
	// "fa-eye" And "fa-eye-slash" icon name or class beside Password text box in Donor-->Login page
	if (passwordField.type === 'password') {
		passwordField.type = 'text'
		togglePassword.classList.remove('fa-eye')
		togglePassword.classList.add('fa-eye-slash')
	} else {
		passwordField.type = 'password'
		togglePassword.classList.remove('fa-eye-slash')
		togglePassword.classList.add('fa-eye')
	}
}

/********************** Aadhar validation logics ******/
//#region Aadhar logic
function validateAadhaarNumber(aadhaar) {
	// Regular expression to check if the Aadhaar number is exactly 12 digits
	const aadhaarRegex = /^\d{12}$/

	if (!aadhaarRegex.test(aadhaar)) {
		return false // Aadhaar number must be 12 digits
	}

	return isValidVerhoeff(aadhaar)
}

// Verhoeff algorithm implementation
const verhoeffTableD = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
	[2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
	[3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
	[4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
	[5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
	[6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
	[7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
	[8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
	[9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

const verhoeffTableP = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
	[2, 8, 0, 7, 9, 6, 4, 1, 3, 5],
	[3, 9, 1, 0, 5, 7, 8, 2, 6, 4],
	[4, 2, 8, 6, 7, 3, 0, 9, 5, 1],
	[5, 4, 6, 8, 0, 2, 9, 7, 1, 3],
	[6, 3, 9, 2, 8, 0, 7, 5, 4, 1],
	[7, 0, 4, 9, 1, 5, 2, 3, 6, 8],
	[8, 7, 5, 4, 3, 9, 1, 6, 0, 2],
	[9, 6, 3, 5, 8, 1, 4, 7, 2, 0],
]

const verhoeffTableInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

function isValidVerhoeff(aadhaar) {
	let checksum = 0
	let reversedArray = aadhaar.split('').reverse().map(Number)

	for (let i = 0; i < reversedArray.length; i++) {
		checksum = verhoeffTableD[checksum][verhoeffTableP[i % 8][reversedArray[i]]]
	}

	return checksum === 0
}
//#endregion

//#region Notification Logic

function closeNotification() {
	const notification = document.getElementsByClassName('notification')[0]

	notification.animate([{ bottom: '10px' }, { bottom: '-100px' }], {
		duration: IsMobile() ? 600 : 800,
		iterations: 1,
		easing: 'ease-in-out',
	})

	notification.style.bottom = '-100px'
	setTimeout(() => {
		notification.style.display = 'none'
	}, 800)
}

function showNotification(type, message) {
	// these are types of icons
	// <i class="fas fa-circle-check"></i>
	// <i class="fa-solid fa-triangle-exclamation"></i>
	//<i class="fa-solid fa-circle-info"></i>
	// <i class="fa-solid fa-circle-exclamation"></i>
	const iconDiv = document.getElementsByClassName('noty-type')[0]
	const messageDiv = document.getElementsByClassName('noty-message')[0]
	const notification = document.getElementsByClassName('notification')[0]

	switch (type) {
		case 'INFO':
			iconDiv.innerHTML = '<i class="fa-solid fa-circle-info"></i>'
			break
		case 'ERROR':
			iconDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>'
			break
		case 'WARNING':
			iconDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'
			break
		case 'SUCCESS':
			iconDiv.innerHTML = '<i class="fas fa-circle-check"></i>'
			break
		default:
			console.log('Type not valid')
			break
	}

	notification.style.display = 'flex'
	messageDiv.innerHTML = message

	// animate function (line 401) takes two params
	// 1st one is the animation direction in array of objects [{...},{...}]
	// now this object will contain { element's styling parameter (like height, bottom, top) : it's value }
	// 2nd parameter is animation options like duration of animation , number of times animation should repeat etc.

	const keyframes = [{ bottom: '-100px' }, { bottom: '10px' }]

	const animationOptions = {
		duration: 200,
		iterations: 1,
		easing: 'ease-in',
	}

	notification.animate(keyframes, animationOptions)

	notification.style.bottom = '10px'

	setTimeout(() => {
		closeNotification()
	}, 5000)
}

//#endregion

//#region Mobile device check
function IsMobile() {
	return window.matchMedia('(max-width: 480px)').matches
}

//#endregion
