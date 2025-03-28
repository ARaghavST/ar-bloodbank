var BACKEND_URL = 'http://localhost:8080/bloodbank';

let receiverDataArray = [];

let currentDonorItems = [];

window.onload = function () {
	let sessionExpired = IsSessionExprired();

	if (sessionExpired) {
		localStorage.removeItem('admin');
		window.location.replace('/pages/admin-login.html');
		window.alert('Session expired! Login again');
		return;
	}

	handleDisplaySection();
};

function IsSessionExprired() {
	const adminDataString = localStorage.getItem('admin');

	if (!adminDataString) {
		return true;
	}

	const adminJson = JSON.parse(adminDataString);

	const expiryTime = new Date(adminJson.expires_at);
	const currentTime = new Date();

	return currentTime.getTime() > expiryTime.getTime();
}

function handleDisplaySection() {
	let currentLocation = window.location.href;
	let urlObject = new URL(currentLocation);

	let section = urlObject.searchParams.get('section');
	let type = urlObject.searchParams.get('type');

	const profileTabs = document.getElementsByClassName('profile-tabs');
	const requestTabs = document.getElementsByClassName('donor-request-tab');

	const approvedDonorsCheckFilter = document.getElementById(
		'donor-filter-approved-status-check',
	);
	const approvedDonorsCheckLabel = document.getElementsByClassName(
		'donor-filter-approved-status-label',
	)[0];

	const receiverSection = document.getElementById('receivers-section');
	const donorSection = document.getElementById('donors-section');

	for (let i = 0; i < requestTabs.length; i++) {
		if (requestTabs[i].innerHTML.split(' ')[0] === type) {
			requestTabs[i].classList.add('selected-request-tab');
		} else {
			requestTabs[i].classList.remove('selected-request-tab');
		}
	}

	for (let i = 0; i < profileTabs.length; i++) {
		if (profileTabs[i].innerHTML === section) {
			profileTabs[i].classList.add('selected-tab');
		} else {
			profileTabs[i].classList.remove('selected-tab');
		}
	}

	if (section === 'Donors') {
		// When we are in Donors section

		receiverSection.style.display = 'none';
		donorSection.style.display = 'flex';

		if (type === 'Signup') {
			showNotApprovedDonors();
		} else {
			approvedDonorsCheckFilter.disabled = true;
			approvedDonorsCheckLabel.style.color = '#ccc';
			showDonationRequests();
		}
	} else {
		// When we are in Receivers section

		receiverSection.style.display = 'flex';
		donorSection.style.display = 'none';
		showPendingReceiversList();
	}
}

function logoutAdminProfile() {
	localStorage.removeItem('admin');
	window.location.replace('/pages/admin-login.html');
}

function switchTab(clickedSection) {
	if (clickedSection.innerHTML === 'Donors') {
		window.location.replace('../pages/admin-profile.html?section=Donors&type=Signup');
	} else {
		window.location.replace('../pages/admin-profile.html?section=Receivers');
	}
}

function getYearsDifference(dateString) {
	const [day, month, year] = dateString.split('/').map(Number);
	const inputDate = new Date(year, month - 1, day);
	const currentDate = new Date();

	let years = currentDate.getFullYear() - inputDate.getFullYear();

	// Adjust if the birthday hasn't occurred yet this year
	if (
		currentDate.getMonth() < inputDate.getMonth() ||
		(currentDate.getMonth() === inputDate.getMonth() &&
			currentDate.getDate() < inputDate.getDate())
	) {
		years--;
	}

	return years;
}

function formatDate(dateString) {
	// Parse the given date string
	const date = new Date(dateString.replace(' ', 'T')); // Convert to ISO format

	// Define month names
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	// Extract date components
	const day = date.getDate();
	const month = monthNames[date.getMonth()];
	const year = date.getFullYear();

	// Format time with leading zeros if needed
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

function showNotApprovedDonors() {
	const loader = document.getElementById('donor-items-loader');
	const noRecordsLabel = document.getElementById('donor-no-records-found-label');
	const donorDataContainer = document.getElementsByClassName('donor-data-section')[0];

	donorDataContainer.style.display = 'none';

	donorDataContainer.innerHTML = '';
	loader.style.display = 'flex';
	noRecordsLabel.style.display = 'none';

	fetch(`${BACKEND_URL}/admin?usertype=donors&status=0`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			currentDonorItems = [];

			loader.style.display = 'none';

			if (data.data) {
				console.log(data.data);
				if (data.data.length === 0) {
					noRecordsLabel.style.display = 'flex';
					return;
				}

				for (let i = 0; i < data.data.length; i++) {
					let item = data.data[i];

					currentDonorItems.push(item);

					donorDataContainer.innerHTML += `
                <div class="donor-card ${
					item.e_ready === 1 ? 'emergency-card' : ''
				}" onclick="openDonorDetailsDialogBox(${item.id})">
                <div style="display: flex; justify-content: space-between;">
                  <div id="donor_id" >#${item.id}</div>
                  <div style="color: #e22424; text-shadow: 1px 1px 10px rgba(0,0,0,0.8);">${
					item.blood_group
				}</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                 <div style="font-weight: 600;" id="donor_name">${item.name}</div>
                <div style="display: flex; justify-content: space-around;gap: 2px;">
                 <div style="padding: 2px;" id="donor_gender">${item.gender}</div>
                 <div style="border-left: 2px solid #ccc;padding: 2px;" id="donor_age">${getYearsDifference(
					item.dob,
				)}</div>
               </div>
                </div>
                 <div style="display: flex; justify-content:space-between; font-size: 10px; gap: 20px;">
                 <div>Req on :</div>
                 <div style="font-style: italic;" id="donor_reqon">${formatDate(item.req_on)}</div>
                </div>
              </div>`;
				}

				donorDataContainer.style.display = 'flex';
			} else {
				// notify empty data

				noRecordsLabel.style.display = 'flex';
			}
		})
		.catch((err) => {
			// notify
			noRecordsLabel.style.display = 'flex';
		});
}

var donationRequestArray = [];

function showDonationRequests() {
	const loader = document.getElementById('donor-items-loader');
	const noRecordsLabel = document.getElementById('donor-no-records-found-label');
	const donorDataContainer = document.getElementsByClassName('donor-data-section')[0];

	donorDataContainer.innerHTML = '';
	noRecordsLabel.style.display = 'none';
	loader.style.display = 'flex';

	donationRequestArray = [];

	fetch(`${BACKEND_URL}/admin?usertype=donors&status=2`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			donationRequestArray = [];

			loader.style.display = 'none';
			const records = data.data;

			if (!records || records.length === 0) {
				noRecordsLabel.children[0].innerHTML = 'No new donation requests';
				noRecordsLabel.style.display = 'flex';
				return;
			}

			for (let i = 0; i < records.length; i++) {
				const item = records[i];

				donationRequestArray.push(item);

				donorDataContainer.innerHTML += `<div class="donor-card" onclick="openDonorDetailsDialogBox(${
					item.donor_id
				})">
                <div style="display: flex; justify-content: space-between;">
                  <div id="donor_id" >#${item.donor_id}</div>
                  <div style="color: #e22424; text-shadow: 1px 1px 10px rgba(0,0,0,0.8);">${
					item.blood_group
				}</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                 <div style="font-weight: 600;" id="donor_name">${item.name}</div>
                <div style="display: flex; justify-content: space-around;gap: 2px;">
                 <div style="padding: 2px;" id="donor_gender">${item.gender}</div>
                 <div style="border-left: 2px solid #ccc;padding: 2px;" id="donor_age">${getYearsDifference(
					item.dob,
				)}</div>
               </div>
                </div>
                 <div style="display: flex; justify-content:space-between; font-size: 10px; gap: 20px;">
                 <div>Req on :</div>
                 <div style="font-style: italic;" id="donor_reqon">${formatDate(item.req_on)}</div>
                </div>
              </div>`;
			}
			donorDataContainer.style.display = 'flex';
		})
		.catch((err) => {
			noRecordsLabel.children[0].innerHTML = 'No new donation requests';
			noRecordsLabel.style.display = 'flex';
		});
}

function addAdminDonorFilters() {
	const nameFilter = document.getElementById('donor-filter-name').value;
	const dateFrom = document.getElementById('donor-filter-date-from').value;
	const dateTo = document.getElementById('donor-filter-date-to').value;
	const approvedStatusCheck = document.getElementById('donor-filter-approved-status-check');
	const emergencyReadyCheck = document.getElementById('donor-filter-emergency-check');

	const donorDataDisplayType = document.getElementsByClassName('selected-request-tab')[0];

	const donorDataContainer = document.getElementsByClassName('donor-data-section')[0];
	const loader = document.getElementById('donor-items-loader');
	const noRecordsLabel = document.getElementById('donor-no-records-found-label');

	let donorStatusToFetch = 0;
	let donorReqOnDateRange = '';
	let donorEmergencyFetch = 0;

	if (approvedStatusCheck.checked) {
		donorStatusToFetch = 1;
	}

	if (emergencyReadyCheck.checked) {
		donorEmergencyFetch = 1;
	}

	if (dateFrom && !dateTo) {
		window.alert('Both To and From dates are required !');
		return;
	}

	if (!dateFrom && dateTo) {
		window.alert('Both To and From dates are required !');
		return;
	}

	if (!dateFrom && !dateTo) {
		donorReqOnDateRange = '';
	} else {
		donorReqOnDateRange = dateFrom + ' 00:00:00' + ',' + dateTo + ' 23:59:59';
	}

	donorDataContainer.style.display = 'none';
	donorDataContainer.innerHTML = '';
	loader.style.display = 'flex';
	noRecordsLabel.style.display = 'none';

	donationRequestArray = [];

	let fetchUrl = `${BACKEND_URL}/admin?usertype=donors&name=${nameFilter}&status=${donorStatusToFetch}&req_date_range=${encodeURIComponent(
		donorReqOnDateRange,
	)}&emergency=${donorEmergencyFetch}`;

	if (donorDataDisplayType.innerHTML === 'Donation Requests') {
		fetchUrl = `${BACKEND_URL}/admin?usertype=donors&name=${nameFilter}&status=2&req_date_range=${encodeURIComponent(
			donorReqOnDateRange,
		)}`;

		fetch(fetchUrl)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				loader.style.display = 'none';
				donationRequestArray = [];
				const records = data.data;

				if (!records || records.length === 0) {
					noRecordsLabel.children[0].innerHTML = 'No new donation requests';
					noRecordsLabel.style.display = 'flex';
					return;
				}

				for (let i = 0; i < records.length; i++) {
					const item = records[i];

					donationRequestArray.push(item);

					donorDataContainer.innerHTML += `<div class="donor-card" onclick="openDonorDetailsDialogBox(${
						item.donor_id
					})">
                  <div style="display: flex; justify-content: space-between;">
                    <div id="donor_id" >#${item.donor_id}</div>
                    <div style="color: #e22424; text-shadow: 1px 1px 10px rgba(0,0,0,0.8);">${
					item.blood_group
				}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                   <div style="font-weight: 600;" id="donor_name">${item.name}</div>
                  <div style="display: flex; justify-content: space-around;gap: 2px;">
                   <div style="padding: 2px;" id="donor_gender">${item.gender}</div>
                   <div style="border-left: 2px solid #ccc;padding: 2px;" id="donor_age">${getYearsDifference(
					item.dob,
				)}</div>
                 </div>
                  </div>
                   <div style="display: flex; justify-content:space-between; font-size: 10px; gap: 20px;">
                   <div>Req on :</div>
                   <div style="font-style: italic;" id="donor_reqon">${formatDate(
					item.req_on,
				)}</div>
                  </div>
                </div>`;
				}
				donorDataContainer.style.display = 'flex';
			})
			.catch((err) => {
				noRecordsLabel.children[0].innerHTML = 'No new donation requests';
				noRecordsLabel.style.display = 'flex';
			});

		return;
	}

	fetch(fetchUrl)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			currentDonorItems = [];
			loader.style.display = 'none';

			if (data.data) {
				if (data.data.length === 0) {
					noRecordsLabel.style.display = 'flex';
					return;
				}

				donorDataContainer.style.display = 'flex';
				// dynamically setting height of parent , to match will scroll bar and cards content
				// the container "donorDataContainer" will take max 5 rows, each having 4 cards each
				// If we have rows more than 5 , then we display scrollbar
				let rows = data.data.length / 4;
				let rem = data.data.length % 4;
				if (rows <= 5) {
					donorDataContainer.style.height = rows * 13 + rem * 13 + 'vh';
				} else {
					donorDataContainer.style.height = rows * 13 + 'vh';
				}

				for (let i = 0; i < data.data.length; i++) {
					let item = data.data[i];

					currentDonorItems.push(item);

					donorDataContainer.innerHTML += `
                <div class="donor-card ${
					item.e_ready === 1 ? 'emergency-card' : ''
				}" onclick="openDonorDetailsDialogBox(${item.id})">
                <div style="display: flex; justify-content: space-between;">
                  <div id="donor_id" >#${item.id}</div>
                  <div style="color: #e22424; text-shadow: 1px 1px 10px rgba(0,0,0,0.8);">${
					item.blood_group
				}</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                 <div style="font-weight: 600;" id="donor_name">${item.name}</div>
                <div style="display: flex; justify-content: space-around;gap: 2px;">
                 <div style="padding: 2px;" id="donor_gender">${item.gender}</div>
                 <div style="border-left: 2px solid #ccc;padding: 2px;" id="donor_age">${getYearsDifference(
					item.dob,
				)}</div>
               </div>
                </div>
                 <div style="display: flex; justify-content:space-between; font-size: 10px; gap: 20px;">
                 <div>Req on :</div>
                 <div style="font-style: italic;" id="donor_reqon">${formatDate(item.req_on)}</div>
                </div>
              </div>`;
				}
			} else {
				noRecordsLabel.style.display = 'flex';
			}
		})
		.catch((err) => {
			console.log(err);
			noRecordsLabel.style.display = 'flex';
		});
}

function performApproveCheck(checkedBox) {
	const emergencyCheckBox = document.getElementById('donor-filter-emergency-check');
	const emergencyLabel = document.getElementsByClassName('donor-filter-emergency-label')[0];
	if (checkedBox.checked) {
		emergencyLabel.style.color = 'black';
		emergencyCheckBox.disabled = false;
	} else {
		emergencyLabel.style.color = '#ccc';
		emergencyCheckBox.disabled = true;
	}
}

function clearAdminDonorFilters() {
	const nameFilter = document.getElementById('donor-filter-name');
	const dateFrom = document.getElementById('donor-filter-date-from');
	const dateTo = document.getElementById('donor-filter-date-to');
	const approvedStatusCheck = document.getElementById('donor-filter-approved-status-check');
	const emergencyCheckBox = document.getElementById('donor-filter-emergency-check');
	const emergencyLabel = document.getElementsByClassName('donor-filter-emergency-label')[0];

	const donorDataDisplayType = document.getElementsByClassName('selected-request-tab')[0];

	nameFilter.value = '';
	dateFrom.value = '';
	dateTo.value = '';
	approvedStatusCheck.checked = false;
	emergencyCheckBox.checked = false;
	emergencyCheckBox.disabled = true;
	emergencyLabel.style.color = '#ccc';

	if (donorDataDisplayType.innerHTML === 'Donation Requests') {
		showDonationRequests();
	} else {
		showNotApprovedDonors();
	}
}

/**
 *
 * --- Below is receivers section
 *
 */

var currentIndex = 0;
var maxIndex = 0;

function showPendingReceiversList() {
	const rightThumb = document.getElementsByClassName('right-thumb')[0];
	const leftThumb = document.getElementsByClassName('left-thumb')[0];
	receiverDataArray = [];

	const receiversContainer = document.getElementById('receivers-data');
	const loader = document.getElementById('receivers-items-loader');
	const noReceiversLabel = document.getElementById('no-records-found-label');

	fetch(`${BACKEND_URL}/admin?usertype=receivers`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.data) {
				if (data.data.length === 0) {
					// if we have no data in data array
					// both thumbs are disabled
					// we will show no receivers label
					noReceiversLabel.style.display = 'flex';
					leftThumb.classList.add('blocked-thumb');
					rightThumb.classList.add('blocked-thumb');
				} else {
					maxIndex = data.data.length - 1;

					if (data.data.length === 1) {
						// if we have single data in data array
						// both thumbs are disabled
						leftThumb.classList.add('blocked-thumb');
						rightThumb.classList.add('blocked-thumb');
					}
				}
				loader.style.display = 'none';

				for (var i = 0; i < data.data.length; i++) {
					let item = data.data[i];

					receiversContainer.innerHTML += `
                    <div class="card card-${item.sno} ${
						item.status === 1 ? 'approved-receiver' : ''
					}" onclick="handleCardClick(${item.sno})">
                        ${item.status === 1 ? '<div id="approved-tag">APPROVED</div>' : ''}
                        <h2>Receiver's Name : <span class="highlight">${item.name}</span></h2>
                        <p>📞 Phone: <span class="highlight">${item.phno}</span></p>
                        <p>📧 Email: <span class="highlight">${item.email}</span></p>
                        <p>🆔 Aadhar: <span class="highlight">${item.aadhar}</span></p>
                        <p>🩸 Blood Group Needed: <span class="highlight">${
						item.bg_needed
					}</span></p>
                        <p>📦 Quantity: <span class="highlight">${item.quantity} mL</span></p>
                        <div class="footer">
                            <span>📅 Requested on: <strong>${item.req_date}</strong></span>
                            <span>#ID No: <strong>${item.sno}</strong></span>
                        </div>
                    </div>
                    `;

					maximumLength = data.data.length;

					receiverDataArray.push(item);
				}
			} else {
				// notification
			}
		})
		.catch((err) => {
			loader.style.display = 'none';
			noReceiversLabel.style.display = 'flex';
		});
}

function moveNext() {
	const carousel = document.getElementById('receivers-data');
	const rightThumb = document.getElementsByClassName('right-thumb')[0];
	const leftThumb = document.getElementsByClassName('left-thumb')[0];

	if (!rightThumb.classList.contains('blocked-thumb')) {
		if (currentIndex < maxIndex) {
			currentIndex++;
		}

		leftThumb.classList.remove('blocked-thumb');
		carousel.style.transform = `translateX(-${currentIndex * 680}px)`;

		if (currentIndex === maxIndex) {
			rightThumb.classList.add('blocked-thumb');
		}
	}
}

function movePrevious() {
	const carousel = document.getElementById('receivers-data');
	const rightThumb = document.getElementsByClassName('right-thumb')[0];
	const leftThumb = document.getElementsByClassName('left-thumb')[0];

	if (!leftThumb.classList.contains('blocked-thumb')) {
		if (currentIndex > 0) {
			currentIndex--;
		}

		rightThumb.classList.remove('blocked-thumb');
		carousel.style.transform = `translateX(-${currentIndex * 680}px)`;

		if (currentIndex === 0) {
			leftThumb.classList.add('blocked-thumb');
		}
	}
}

function handleStatusCheckBox(selectedCheckbox) {
	const checkboxs = document.getElementsByName('status_check');

	checkboxs.forEach((checkbox) => {
		if (checkbox === selectedCheckbox) {
			checkbox.checked = true;
		} else {
			checkbox.checked = false;
		}
	});
}

function showFiltersList() {
	const currentCaret = document.getElementsByClassName('default-caret')[0];

	if (!filtersApplied) {
		currentCaret.classList.remove('default-caret');
	}

	const filtersSection = document.getElementsByClassName('filters-section')[0];

	if (currentCaret.classList.contains('fa-caret-up')) {
		// means we will show list here
		const toShowCaret = document.getElementsByClassName('fa-caret-down')[0];

		toShowCaret.classList.add('default-caret');
		filtersSection.style.height = '100px';
		filtersSection.style.padding = '5px';
	} else {
		// we will hide list
		if (!filtersApplied) {
			const toShowCaret = document.getElementsByClassName('fa-caret-up')[0];

			toShowCaret.classList.add('default-caret');

			setTimeout(() => {
				filtersSection.style.padding = '0px';
			}, 200);

			filtersSection.style.height = '0px';
		}
	}
}

var filtersApplied = false;

// This function is called when ever filter is applied
function applyFilter() {
	// line 271 -> line 277 getting all HTML elements
	const receiversContainer = document.getElementById('receivers-data');
	const loader = document.getElementById('receivers-items-loader');
	const noReceiversLabel = document.getElementById('no-records-found-label');

	const carousel = document.getElementById('receivers-data');
	const rightThumb = document.getElementsByClassName('right-thumb')[0];
	const leftThumb = document.getElementsByClassName('left-thumb')[0];

	// Line 280 -> 284 : Getting filter values from input textbox and checkboxes
	const nameToSearch = document.getElementById('receiver-name-search').value;
	const bloodGroupCheckedboxes = document.getElementsByName('blood_group');
	const statusCheckedBoxes = document.getElementsByName('status_check');
	const dateFrom = document.getElementById('date_from').value;
	const dateTo = document.getElementById('date_to').value;

	let checkedBloodGroupString = '';
	let status = '';

	// making blood group as form of "B+,O+,..."
	bloodGroupCheckedboxes.forEach((checkbox) => {
		if (checkbox.checked) {
			checkedBloodGroupString = checkedBloodGroupString + checkbox.value + ',';
		}
	});

	// removing the last (extra) "," from the string , because it needs to be removed for JAVA backend to prepare MySQL query
	checkedBloodGroupString = checkedBloodGroupString.substring(
		0,
		checkedBloodGroupString.length - 1,
	);

	// this is for setting status 0 / 1
	statusCheckedBoxes.forEach((checkbox) => {
		if (checkbox.checked) {
			status = checkbox.value;
		}
	});

	receiversContainer.innerHTML = '';

	// this is to make date from and to in form of "DD-MM-YYYY 00:00:00,DD-MM-YYYY 23:59:59", for MySQL query in backend
	let rangeOfDate = '';
	if (dateFrom && dateTo) {
		rangeOfDate = dateFrom + ' 00:00:00' + ',' + dateTo + ' 23:59:59';
	}

	receiverDataArray = [];
	// preparing the backend fetch url
	let url = `${BACKEND_URL}/admin?usertype=receivers&req_date_range=${
		rangeOfDate !== '' ? encodeURIComponent(rangeOfDate) : ''
	}&name=${nameToSearch}&status=${status}&bloodtype=${
		checkedBloodGroupString !== '' ? encodeURIComponent(checkedBloodGroupString) : ''
	}`;

	// setting loader to be visible
	loader.style.display = 'flex';

	fetch(url)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.data) {
				// we have received some data in response

				// Line 330 : Is to set the carousel to start point , every time filter applied
				carousel.style.transform = `translateX(0px)`;
				// Line 332 : Is to set the currentIndex i.e. index upto which earlier we have scrolled the card
				currentIndex = 0;

				if (data.data.length === 0) {
					// if we have nothing in data array i.e. no data present

					// we will disable the thumbs
					leftThumb.classList.add('blocked-thumb');
					rightThumb.classList.add('blocked-thumb');

					noReceiversLabel.style.display = 'flex';
				} else {
					maxIndex = data.data.length - 1;

					if (data.data.length === 1) {
						// if we have single data in data array
						// both thumbs are disabled
						leftThumb.classList.add('blocked-thumb');
						rightThumb.classList.add('blocked-thumb');
					} else {
						// if we have some data which is greater than 1, then make the thumbs UI as it was earlier i.e. left disabled , right enabled
						leftThumb.classList.add('blocked-thumb');
						rightThumb.classList.remove('blocked-thumb');
					}
				}
				// loader will be hidden , as we have got some response from backend
				loader.style.display = 'none';

				for (var i = 0; i < data.data.length; i++) {
					let item = data.data[i];

					// appending data items into receiver data container ("receivers-data")

					receiversContainer.innerHTML += `
                <div class="card card-${item.sno} ${
						item.status === 1 ? 'approved-receiver' : ''
					}" onclick="handleCardClick(${item.sno})">
                    ${item.status === 1 ? '<div id="approved-tag">APPROVED</div>' : ''}
                    <h2>Receiver's Name : <span class="highlight">${item.name}</span></h2>
                    <p>📞 Phone: <span class="highlight">${item.phno}</span></p>
                    <p>📧 Email: <span class="highlight">${item.email}</span></p>
                    <p>🆔 Aadhar: <span class="highlight">${item.aadhar}</span></p>
                    <p>🩸 Blood Group Needed: <span class="highlight">${item.bg_needed}</span></p>
                    <p>📦 Quantity: <span class="highlight">${item.quantity} mL</span></p>
                    <div class="footer">
                        <span>📅 Requested on: <strong>${item.req_date}</strong></span>
                        <span>#ID No: <strong>${item.sno}</strong></span>
                    </div>
                </div>
                `;

					receiverDataArray.push(item);

					maximumLength = data.data.length;
				}
				// setting filters as true,
				// this will help us to manage the filter dropdown functionality (line no. 225)
				filtersApplied = true;
			} else {
				// the data key is not present in response
				// means we have some errors in response
				// we will give notification
			}
		})
		.catch((err) => {
			// some error occured while calling api

			loader.style.display = 'none';
			noReceiversLabel.style.display = 'flex';
		});
}

function clearFilter() {
	window.location.reload(true);
}

function handleCardClick(targetReceiverId) {
	const clickedCardData = receiverDataArray.find(
		(receiver) => receiver.sno === targetReceiverId,
	);

	const clickedCard = document.getElementsByClassName(`card-${targetReceiverId}`)[0];
	const overlay = document.getElementsByClassName('overlay')[0];
	const statusUpdateDialogBox = document.getElementsByClassName('update-status-dialog-box')[0];

	let dialogBoxReceiverId = document.getElementById('rec_id');
	let dialogBoxReceiverName = document.getElementById('rec_name');
	let dialogBoxReceiverBloodGroup = document.getElementById('rec_bg');
	let dialogBoxReceiverQuantity = document.getElementById('rec_amount');

	if (!clickedCard.classList.contains('approved-receiver')) {
		statusUpdateDialogBox.style.display = 'flex';
		overlay.style.display = 'flex';

		dialogBoxReceiverId.innerHTML = '#' + targetReceiverId;
		dialogBoxReceiverName.innerHTML = clickedCardData.name;
		dialogBoxReceiverBloodGroup.innerHTML = clickedCardData.bg_needed;
		dialogBoxReceiverQuantity.innerHTML = clickedCardData.quantity;
	}
}

function handleCloseDialog() {
	const overlay = document.getElementsByClassName('overlay')[0];
	overlay.style.display = 'none';
}

function handleApproveReceiver() {
	const updateStatusDialogBox = document.getElementsByClassName('update-status-dialog-box')[0];
	const spinnerParent = document.getElementsByClassName('spinner-parent-div')[0];
	const overlay = document.getElementsByClassName('overlay')[0];

	updateStatusDialogBox.style.display = 'none';
	spinnerParent.style.display = 'flex';

	const targetId = document.getElementById('rec_id').innerHTML.substring(1);

	console.log(targetId);

	fetch('http://localhost:8080/bloodbank/update-status?for=receiver', {
		method: 'PUT',
		body: JSON.stringify({
			id: targetId,
		}),
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			overlay.style.display = 'none';

			setTimeout(() => {
				window.location.reload(true);
			}, 400);
			if (data.data) {
				window.alert('Approved');
			} else {
				// we will show notification
			}
		})
		.catch((err) => {
			overlay.style.display = 'none';
			// we will show notification again for error
		});
}

/** Donor section js starts here */

function switchDonorRequestTab(clickedRequestTab) {
	if (clickedRequestTab.innerHTML === 'Donation Requests') {
		window.location.replace('../pages/admin-profile.html?section=Donors&type=Donation');
	} else {
		window.location.replace('../pages/admin-profile.html?section=Donors&type=Signup');
	}
}

//#region Donor functions

function openDonorDetailsDialogBox(targetId) {
	const selectedRequestTab = document.getElementsByClassName('selected-request-tab')[0];
	const overlay = document.getElementsByClassName('overlay')[0];

	if (selectedRequestTab.innerHTML.split(' ')[0] === 'Signup') {
		let clickedDonor = currentDonorItems.find((item) => item.id === targetId);

		let isDonorAvailable = clickedDonor.availability === 'YES';

		const isRequestMailAllowed =
			clickedDonor.status === 1 && clickedDonor.e_ready === 1 && isDonorAvailable;

		let age = getYearsDifference(clickedDonor.dob);

		overlay.innerHTML = ` 
        <div class="donor-details-dialog-box">
         <div style="padding: 15px;">
        <div class="section-1">
          <div id="dialog_donor_id">#${clickedDonor.id}</div>
          <div>
            <div id="dialog_donor_name">${clickedDonor.name}</div>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
    
              <div id="donor_age_gender" style="padding: 2px; text-align: center; font-weight: 600;">
              ${age}, ${
			clickedDonor.gender === 'M'
				? '<i class="fas fa-mars" style="color: darkblue; scale: 1.1; text-shadow: 1px 2px 2px rgba(255,255,255,0.7);"></i>'
				: '<i class="fas fa-venus" style="color:palevioletred; scale: 1.1; text-shadow: 1px 2px 2px rgba(0,0,0,0.7);"></i>'
		} 
              </div>
            </div>
          </div>
        </div>
        <div class="section-2">
          <h3 style="border-bottom: 4px solid #b11e1e; width: 15%;">Info</h3>
          <div style="padding: 5px;">
            <div style="display: flex; justify-content: space-between;">
              <div>Blood Group</div>
              <div id="donor_bgroup" style="width:50%; text-align:center; color: red;">${
				clickedDonor.blood_group
			}</div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <div>Last Donated</div>
              <div id="donor_last_donated" ${
				!clickedDonor.last_donation ? 'style="width:53%; text-align:center;"' : ''
			} >${
			clickedDonor.last_donation ? formatDate(clickedDonor.last_donation) : '---'
		}</div>
            </div>
          </div>
        </div>
        <div class="section-3">
          <h3 style="border-bottom: 4px solid #b11e1e; width: 28%;">Contact</h3>
          <div style="padding: 5px;">
            <div style="display: flex; justify-content: space-between; ">
              <div>Phone</div>
              <div id="donor_phone" style="text-align: start; ">+91-${clickedDonor.phno}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div>Email</div>
              <div id="donor_email" style="display: flex; justify-content: start;">${
				clickedDonor.email
			}</div>
            </div>
          </div>
        </div>
        <div class="section-4">
      
        ${
			isDonorAvailable
				? clickedDonor.e_ready
					? '<div id="donor_emergency_label" >Emergency Available</div>'
					: ''
				: '<div id="not_available_label" >Not Available</div>'
		}

        </div>
        <div class="dialog_spinner"><div class="spinner" style="scale : 1.3;"></div></div>
        <div class="request_dialog_button" style="display: flex; justify-content: center; margin-top: 10px; gap:20px">
              ${
				clickedDonor.status === 0
					? `<div class="approve_donor_button" onclick="handleDonorApproval(${clickedDonor.id})">Approve Donor</div>`
					: ''
			}
              ${
				isRequestMailAllowed
					? `<div class="request_blood_btn" onclick="confirmSendEmail(${clickedDonor.id})">Request Blood <i class="fas fa-paper-plane"></i></div>`
					: ''
			}
          <div class="close_form_btn" onclick="handleDetailsDialogBoxClose()">Close</div>
        </div>
       </div>
    </div>`;

		overlay.style.display = 'flex';
	} else {
		// donation
		const clickedDonationRequestCard = donationRequestArray.find(
			(card) => parseInt(card.donor_id) === targetId,
		);

		let age = getYearsDifference(clickedDonationRequestCard.dob);

		overlay.innerHTML = ` 
        <div class="donation-submit-dialog-box">
         <div style="padding: 15px;">
        <div class="section-1">
          <div id="dialog_donor_id">#${clickedDonationRequestCard.donor_id}</div>
          <div>
            <div id="dialog_donor_name">${clickedDonationRequestCard.name}</div>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
    
              <div id="donor_age_gender" style="padding: 2px; text-align: center; font-weight: 600;">
              ${age}, ${
			clickedDonationRequestCard.gender === 'M'
				? '<i class="fas fa-mars" style="color: darkblue; scale: 1.1; text-shadow: 1px 2px 2px rgba(255,255,255,0.7);"></i>'
				: '<i class="fas fa-venus" style="color:palevioletred; scale: 1.1; text-shadow: 1px 2px 2px rgba(0,0,0,0.7);"></i>'
		} 
              </div>
            </div>
          </div>
        </div>
        <div class="section-2">
          <h3 style="border-bottom: 4px solid #b11e1e; width: 15%;">Info</h3>
          <div style="padding: 5px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="font-weight:500;">Blood Group</div>
              <div id="donor_bgroup" style="width:50%; text-align:center; color: red;">${
				clickedDonationRequestCard.blood_group
			}</div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <div style="font-weight:500;">Last Donated</div>
              <div id="donor_last_donated" ${
				!clickedDonationRequestCard.last_donation
					? 'style="width:53%; text-align:center;"'
					: ''
			} >${
			clickedDonationRequestCard.last_donation
				? formatDate(clickedDonationRequestCard.last_donation)
				: '---'
		}</div>
            </div>
             <div style="display: flex; justify-content: space-between; ">
              <div style="font-weight:500;">Phone</div>
              <div id="donor_phone" style="text-align: start; ">+91-${
				clickedDonationRequestCard.phno
			}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div style="font-weight:500;">Email</div>
              <div id="donor_email" style="display: flex; justify-content: start;">${
				clickedDonationRequestCard.email
			}</div>
            </div>
          </div>
        </div>
        <div class="section-3" style="display : flex; flex-direction:column; gap:10px; padding: 5px;">
        <h3 style="border-bottom: 4px solid #b11e1e; width: 23%;">Details</h3>
            <div style="display: flex; flex-direction:column; gap:5px; ">
                <div style="display: flex; justify-content: space-between; ">
                    <div>Quantity Donated</div>
                    <div id="donated_amount_text" >${200} mL</div>
                </div>
                <div style="display: flex; flex-direction:column;">
                    <span style="font-size:10px; font-style:italic; padding: 5px;">Move the slider to adjust the amount</span>
                    <input type="range" id="amountSlider" min="0" max="500" step="10" value="200" oninput="processBloodAmountDonate(this)">
                </div>
            </div>
            <div class="dialog-box-input-item" style="display: flex; justify-content: space-between; align-items:center; ">
                <div>Donor's Weight</div>
                <div style="width : 50%; text-align:center;">
                    <input type="number" id="donation_request_weight_input"/> &nbsp;Kg
                </div>
            </div>
        </div>
         <div class="dialog_spinner"><div class="spinner" style="scale : 1.3;"></div></div>
        <div class="request_dialog_button" style="display: flex; justify-content: center; margin-top: 10px; gap:20px">
            <div class="submit_donation_form_btn" onclick="handleDonationSubmit(${
				clickedDonationRequestCard.donor_id
			})">Submit</div>
            <div class="close_form_btn" onclick="handleDetailsDialogBoxClose()">Close</div>
        </div>
      
       
       </div>
    </div>`;

		overlay.style.display = 'flex';
	}
}

//#endregion

function confirmSendEmail(targetId) {
	let confirmed = confirm(
		'This will send an email to user seeking for blood donation request. Do you want to continue ?',
	);

	const clickedDonor = currentDonorItems.find((item) => item.id === targetId);

	const spinner = document.getElementsByClassName('dialog_spinner')[0];
	const dialogButtonsToHide = document.getElementsByClassName('request_dialog_button')[0];

	if (confirmed) {
		spinner.style.display = 'flex';
		dialogButtonsToHide.style.display = 'none';
		fetch(`${BACKEND_URL}/sendmail`, {
			method: 'POST',
			body: JSON.stringify({
				email: clickedDonor.email,
				name: clickedDonor.name,
				blood_group: clickedDonor.blood_group,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// notification will be pop-out
				//TODO: Add Notifications here
				spinner.style.display = 'none';
				dialogButtonsToHide.style.display = 'flex';
			})
			.catch((err) => {
				//TODO: Add Notifications here
				spinner.style.display = 'none';
				dialogButtonsToHide.style.display = 'flex';
			});
	}
}

function handleDetailsDialogBoxClose() {
	const overlay = document.getElementsByClassName('overlay')[0];
	const detailsDialogBox = document.getElementsByClassName('donor-details-dialog-box')[0];
	const donationsDialogBox = document.getElementsByClassName('donation-submit-dialog-box')[0];

	if (detailsDialogBox) {
		detailsDialogBox.style.display = 'none';
	}

	if (donationsDialogBox) {
		donationsDialogBox.style.display = 'none';
	}
	overlay.style.display = 'none';
	overlay.innerHTML = '';
}

function processBloodAmountDonate(inputRange) {
	const donatedAmountTextBox = document.getElementById('donated_amount_text');

	setTimeout(() => {
		donatedAmountTextBox.innerHTML = inputRange.value + ' mL';
	}, 200);
}

function handleDonorApproval(donorId) {
	const spinner = document.getElementsByClassName('dialog_spinner')[0];
	const dialogButtonsToHide = document.getElementsByClassName('request_dialog_button')[0];

	const fetchOptions = {
		method: 'PUT',
		body: JSON.stringify({
			id: donorId,
		}),
	};

	spinner.style.display = 'flex';
	dialogButtonsToHide.style.display = 'none';

	fetch(`${BACKEND_URL}/update-status?for=donor`, fetchOptions)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			//TODO: Add Notifications here

			spinner.style.display = 'none';
			dialogButtonsToHide.style.display = 'flex';

			window.location.reload(true);
		})
		.catch((err) => {
			//TODO: Add error Notification here

			spinner.style.display = 'none';
			dialogButtonsToHide.style.display = 'flex';
		});
}

function handleDonationSubmit(donorId) {
	const clickedDonationRequestCard = donationRequestArray.find(
		(card) => parseInt(card.donor_id) === donorId,
	);

	const bloodAmountDiv = document.getElementById('donated_amount_text');
	const weightAmount = document.getElementById('donation_request_weight_input').value;

	const spinner = document.getElementsByClassName('dialog_spinner')[0];
	const dialogButtonsToHide = document.getElementsByClassName('request_dialog_button')[0];

	const updatePayload = {
		donor_id: donorId + '',
		row_id: clickedDonationRequestCard.row_id,
		weight: weightAmount,
		quantity: bloodAmountDiv.innerHTML.split(' ')[0],
	};

	spinner.style.display = 'flex';
	dialogButtonsToHide.style.display = 'none';

	fetch(`${BACKEND_URL}/admin`, {
		method: 'PUT',
		body: JSON.stringify(updatePayload),
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			spinner.style.display = 'none';
			dialogButtonsToHide.style.display = 'flex';

			if (data.data === 1) {
				window.location.reload(true);
			}

			handleDetailsDialogBoxClose();
			//TODO:Add notifications
		})
		.catch((err) => {
			//TODO:Add notifications

			handleDetailsDialogBoxClose();
		});
}
