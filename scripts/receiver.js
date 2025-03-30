var bloodStockMap = {}

var currentBloodMaxValue = 0

//#region Page Reload
window.onload = function () {
	path = window.location.pathname

	var delayBloodStockFetchNotificationFlag = false
	// this notify-receiver key will be added everytime we submit a new blood receiver request
	if (localStorage.getItem('notify-receiver')) {
		showNotification('SUCCESS', localStorage.getItem('notify-receiver'))
		localStorage.removeItem('notify-receiver')

		// delayBloodStockFetchNotificationFlag is used to delay the next incoming "blood stock fetched" notification
		delayBloodStockFetchNotificationFlag = true
	}

	fetchBloodStock(delayBloodStockFetchNotificationFlag)

	const bloodDrops = document.getElementsByName('blood_type')

	for (var i = 0; i < bloodDrops.length; i++) {
		const drop = bloodDrops[i]

		drop.addEventListener('click', () => {
			handleBloodTypeClick(drop)
		})
	}
}
//#endregion

//#region FetchBloodStock Function
function fetchBloodStock(delayBloodStockFetchNotification) {
	const bloodGroupButtonsParent = document.getElementsByClassName('receiver-child-1')[0]
	const buttonsSection = document.getElementsByClassName('receiver-child-1')[0]
	const carouselSection = document.getElementsByClassName('receiver-child-2')[0]
	const loader = document.getElementsByClassName('blood-stock-loader')[0]
	const notAvailableBloodStock = document.getElementsByClassName('blood-stock-not-fetched')[0]
	const bloodDrops = document.getElementsByName('blood_type')

	// refreshing selected blood type to not selected
	bloodDrops.forEach((drop) => {
		drop.classList.remove('selected-blood')
	})

	// setting loader to display flex , and rest are hidden
	buttonsSection.style.display = 'none'
	carouselSection.style.display = 'none'
	loader.style.display = 'flex'

	// to track first available blood and it's amount
	let firstBloodAvailableButton = null
	let firstBloodAvailableAmount = 0

	fetch(`${BACKEND_URL}/bloodstock`)
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			// if no data , then show no stock available label
			if (!data.data) {
				showNotification('INFO', 'Blood stock empty!')
				notAvailableBloodStock.style.display = 'flex'
				return
			}

			bloodStockMap = data.data

			localStorage.setItem('bloodstock', JSON.stringify(bloodStockMap))

			const bloodGroupButtonsArray = bloodGroupButtonsParent.children

			for (let i = 0; i < bloodGroupButtonsArray.length; i++) {
				// loop through blood drops
				const bloodButton = bloodGroupButtonsArray[i]

				if (bloodStockMap[bloodButton.innerHTML] <= 0) {
					// if current blood drop does not have some amount in bloodStockMap , then disable it
					bloodButton.classList.add('not-available-blood')
				} else {
					// logic to set the first available blood as selected
					if (firstBloodAvailableButton === null) {
						firstBloodAvailableButton = bloodButton
						firstBloodAvailableAmount = bloodStockMap[bloodButton.innerHTML]
					}
				}
			}

			// show blood fill animation
			handleFillBlood(firstBloodAvailableButton, firstBloodAvailableAmount)

			setSlidersAndTextBox(firstBloodAvailableAmount)

			loader.style.display = 'none'
			buttonsSection.style.display = 'flex'
			carouselSection.style.display = 'flex'

			if (delayBloodStockFetchNotification) {
				setTimeout(() => {
					showNotification('INFO', 'Blood stock loaded successfully!')
				}, 2000)
			} else {
				showNotification('INFO', 'Blood stock loaded successfully!')
			}
		})
		.catch((err) => {
			loader.style.display = 'none'
			showNotification('INFO', 'Blood stock empty!')
			notAvailableBloodStock.style.display = 'flex'
			notAvailableBloodStock.style.display = 'flex'
		})
}
//#endregion

//#region UI Functionalities

function setSlidersAndTextBox(maxBloodValue) {
	const bloodSlider = document.getElementById('bloodSlider')
	const inputBloodBox = document.getElementById('bloodInput')

	bloodSlider.value = maxBloodValue / 2
	inputBloodBox.value = maxBloodValue / 2
}

//#region Input Range and Text Box Functionality
function processBloodSlider() {
	const slider = document.getElementById('bloodSlider')
	const bloodTextBox = document.getElementById('bloodInput')
	const receiveBloodFill = document.getElementsByClassName('receive-blood')

	// line 221 -> line 223 , means we are restricting slider not to go more than max value
	if (slider.value > currentBloodMaxValue) {
		slider.value = currentBloodMaxValue
	}

	var fillHeight = (slider.value / 1000) * 100

	//  receiveBloodFill[0] denotes the element , because receiveBloodFill in array of elements
	receiveBloodFill[0].style.height = `${fillHeight}%`

	bloodTextBox.value = slider.value
}

function processBloodInputText() {
	const textbox = document.getElementById('bloodInput')
	const slider = document.getElementById('bloodSlider')
	const receiveBloodFill = document.getElementsByClassName('receive-blood')

	if (textbox.value < 0) {
		textbox.value = 0
	}

	if (textbox.value > currentBloodMaxValue) {
		showNotification('WARNING', 'Reached maximum blood amount !')
		textbox.value = currentBloodMaxValue
	}

	var fillHeight = (textbox.value / 1000) * 100

	receiveBloodFill[0].style.height = `${fillHeight}%`

	slider.value = textbox.value
}

//#endregion

//#region Carousel Move Func
function submitAndShowSecondCard() {
	const bloodGroups = document.getElementsByClassName('selected-blood')

	if (bloodGroups.length == 0) {
		window.alert('Please select a blood group')
		return
	}

	const carousel = document.getElementsByClassName('carousel')

	// below line will store the selected blood group
	var selectedBloodGroup = bloodGroups[0].innerHTML

	// below line will store the amount of blood chosen
	const bloodAmount = document.getElementById('bloodInput').value

	if (parseInt(bloodAmount) < 50) {
		showNotification('WARNING', 'Blood amount request should be atleast 50 mL!')
		return
	}
	let bloodAmountLabel = document.getElementById('blood-amount')
	let bloodTypeLabel = document.getElementById('blood-group')

	if (IsMobile()) {
		bloodAmountLabel = document.getElementById('blood-amount-mobile')
		bloodTypeLabel = document.getElementById('blood-group-mobile')

		bloodAmountLabel.innerHTML = bloodAmount
		bloodTypeLabel.innerHTML = selectedBloodGroup
		carousel[0].style.transform = 'translateX(-360px)'
	} else {
		bloodAmountLabel.innerHTML = bloodAmount
		bloodTypeLabel.innerHTML = selectedBloodGroup
		carousel[0].style.transform = 'translateX(-620px)'
	}

	var bloodRequiredTitle = document.getElementsByClassName('blood-required-title')
	bloodRequiredTitle[0].style.display = 'none'
}
//#endregion

//#region Blood Type Click
function handleBloodTypeClick(clickedElement) {
	if (clickedElement.classList.contains('not-available-blood')) {
		showNotification('WARNING', `Blood type ${clickedElement.innerHTML} not available !`)
		return
	}

	const bloodTypes = document.getElementsByName('blood_type')

	const carousel = document.getElementsByClassName('carousel')

	for (var i = 0; i < bloodTypes.length; i++) {
		const drop = bloodTypes[i]

		if (drop == clickedElement && !drop.classList.contains('not-available-blood')) {
			// if current element is the one we clicked
			drop.classList.add('selected-blood')
		} else {
			drop.classList.remove('selected-blood')
		}
	}

	const clickedBloodAmount = bloodStockMap[clickedElement.innerHTML]
	handleFillBlood(clickedElement, clickedBloodAmount)
	setSlidersAndTextBox(clickedBloodAmount)
}
//#endregion

//#region Go Back Impl
function goToReceiverChild2Card() {
	const carousel = document.getElementsByClassName('carousel')
	carousel[0].style.transform = 'translateX(0px)'

	var bloodRequiredTitle = document.getElementsByClassName('blood-required-title')
	bloodRequiredTitle[0].style.display = 'block'
}
//#endregion

function handleAadharFormat(event, aadharTextBox) {
	if (event.inputType !== 'deleteContentBackward') {
		var text = aadharTextBox.value

		// split text by '-' and join with empty space
		var aadharInNumber = text.split('-').join('')

		if (aadharInNumber.length % 4 === 0 && aadharInNumber.length !== 0 && aadharInNumber.length != 12) {
			text += '-'
		}
		aadharTextBox.value = text
	}
}

//#region Receiver Submit Form
function submitGetBloodForm() {
	const receiverName = document.getElementById('receiver-name').value
	const receiverPhno = document.getElementById('receiver-phno').value
	const receiverEmail = document.getElementById('receiver-email').value
	const receiverAadhar = document.getElementById('receiver-aadhar').value

	const bloodAmount = document.getElementById('blood-amount').innerHTML
	const bloodGroup = document.getElementById('blood-group').innerHTML

	const submitLoader = document.getElementsByClassName('receiver-submit-loader')[0]
	const submitButton = document.getElementsByClassName('receiver-form-button-control')[0]

	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

	if (!emailRegex.test(receiverEmail)) {
		window.alert('Email format invalid')
		document.getElementById('receiver-email').value = ''
		return
	}

	var hyphenRemovedString = receiverAadhar.split('-').join('')

	if (!validateAadhaarNumber(hyphenRemovedString)) {
		window.alert('Aadhar number invalid')
		document.getElementById('receiver-aadhar').value = ''
		return
	}

	const receiverPostData = {
		name: receiverName,
		phno: receiverPhno,
		email: receiverEmail,
		aadhar: hyphenRemovedString,
		quantity: parseFloat(bloodAmount),
		bg_needed: bloodGroup,
	}

	submitButton.style.display = 'none'
	submitLoader.style.display = 'flex'

	fetch(`${BACKEND_URL}/bloodstock`, {
		method: 'POST',
		body: JSON.stringify(receiverPostData),
	})
		.then((response) => {
			return response.json()
		})
		.then((data) => {
			submitLoader.style.display = 'none'
			submitButton.style.display = 'flex'

			if (data.data === 1) {
				localStorage.setItem('notify-receiver', data.message)
				window.location.reload(true)
			}
		})
		.catch((err) => {
			showNotification('ERROR', 'Server closed! Please check server.')
			submitLoader.style.display = 'none'
			submitButton.style.display = 'flex'
		})
}
//#endregion

//#endregion

//#region Blood Fill Animations

// This function is the one which updates the blood height in testtube and "Available amount" mark
function handleFillBlood(clickedBloodType, availBloodAmount) {
	const maxBloodAvailDiv = document.getElementsByClassName('blood')[0]
	const receiveBloodDiv = document.getElementsByClassName('receive-blood')[0]

	clickedBloodType.classList.add('selected-blood')

	const height = availBloodAmount / 10

	currentBloodMaxValue = availBloodAmount

	setTimeout(() => {
		animateBlood(receiveBloodDiv, height / 2)
	}, 800)
	animateBlood(maxBloodAvailDiv, height)
}

function animateBlood(bloodDiv, fillheight) {
	bloodDiv.style.height = fillheight + '%'
	bloodDiv.animate([{ height: '0' }, { height: `${fillheight}%` }], {
		duration: 2000,
		iterations: 1,
		easing: 'ease-in-out',
	})
	if (bloodDiv.classList.contains('blood')) {
		setMaxLine(fillheight)
	}
}

function setMaxLine(maxBloodHeight) {
	const maxAmountMark = document.getElementsByClassName('max-line')[0]

	// 300 is the total height of test tube
	// initially, mark is at top (0px)
	// we need to move it downwards ( negative translation )
	// calculation will be ( total height * (1 - height of available blood / 100 ))
	//  Why (height of available blood / 100)  ? because height was in percentage
	const maxMovement = -(300 * ((100 - maxBloodHeight) / 100))

	maxAmountMark.animate([{ bottom: '0' }, { bottom: `${maxMovement}px` }], {
		duration: 2000,
		iterations: 1,
		easing: 'ease-in-out',
	})
	maxAmountMark.style.bottom = maxMovement + 'px'
}

//#endregion
