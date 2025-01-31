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
    var checkboxes = document.getElementsByName("chk")

    var checkedBox = null;

    checkboxes.forEach((item) => {
        if (item.checked) {
            checkedBox = item;
        }
    })

    // Checking checked box through ID
    switch (checkedBox.id) {
        case "chkd":
            window.location.href = "/pages/donor.html";
            break;

        case "chkr":
            window.location.href = "/pages/receiver.html";
            break;

        default:
            break;
    }

}

// In Donor page for login
function onLogin() {
    window.location.href = "/pages/donor-login.html"
}
// In Donor page for SignUp
function onSignUp() {
    window.location.href = "/pages/donor-signup.html"
}

// Function to show password characters,and to change eye icon to slash and vice versa in Donor-->Login page
function showPassword() {
    const passwordField = document.getElementById("password");
    const togglePassword = document.querySelector(".password-toggle-icon i");
    // "fa-eye" And "fa-eye-slash" icon name or class beside Password text box in Donor-->Login page
    if (passwordField.type === "password") {
        passwordField.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    }
    else {
        passwordField.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
    }

}





// for donor-login.html


function userLogin() {
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    /* Like Dictionaries in Python
     Used for data protection */
    const data = {
        "email": emailField.value,
        "password": passwordField.value
    }

    // This data will be sent to java backend


}


// for donor-signup html
// Used to show mobile number every time user enters a number, and to check mobile number do not exeeds 10 digits
const mobileTextBox = document.getElementById("signup-mobile-text")

mobileTextBox ? mobileTextBox.addEventListener('input', function (event) {

    const mobileNumber = event.target.value

    if (mobileNumber.length > 10) {
        window.alert('Mobile number cannot exceed 10 digits')
        mobileTextBox.value = mobileNumber.substring(0, 10)
    }

}) : ''

// AFT stand for "Apply For Test" in Donor--> SingnUp page
function onClickAFT() {
    const name = document.getElementById("signup-name-text").value;
    const dob = document.getElementById("signup-dob-text").value;
    const mobile = document.getElementById("signup-mobile-text").value;
    const email = document.getElementById("signup-email-text").value;

    const gender = document.querySelector('input[name="gender"]:checked').value;

    const listbox = document.getElementById("listbox-bg");

    let bloodGroup;

    var listLength = listbox.options.length
    for (var i = 0; i < listLength; i++) {
        if (listbox.options[i].selected) {
            bloodGroup = listbox.options[i].value;
        }
    }

    //Regular expression for Date in DOB in Donor-->SignUp Page
    const dateRegx = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    //Regular expression for Email in DOB in Donor-->SignUp Page
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!dateRegx.test(dob)) {
        window.alert("Invalid date format given. Input date in DD/MM/YYYY format")
        document.getElementById("signup-dob-text").value = "";
    }


    if (!emailRegex.test(email)) {
        window.alert('Email format invalid');
        document.getElementById("signup-email-text").value = "";
    }
    // Used for data protection
    const signupData = {
        "name": name,
        "dob": dob,
        "mobile": mobile,
        "email": email,
        "gender": gender,
        "bloodgroup": bloodGroup
    }




    // This signupdata will be sent to java backend

}


/** Script for receiver.html page load */

/** The HTML code for creation of table is present in script.js line no. 189 - 195 */
function getBloodDialog(item){

    const blackScreen = document.getElementById("screen-1")
    const dialogbox = document.getElementById("details-dialog-box")


    // we check empty condition , because initally we set the display of "screen-1" (id) as none - IN CSS
    if (blackScreen.style.display == ""){
        blackScreen.style.display = "block"
    }

    const name = document.getElementById("donor-name-div")
    const phno = document.getElementById("donor-phno-div")
    const email = document.getElementById("donor-email-div")
    const amt = document.getElementById("donor-amt-div")

    name.innerHTML = item.name
    phno.innerHTML = item.name
    email.innerHTML = item.email
    amt.innerHTML = item.amount
}


async function fetchDonors(){

   const response = await fetch("http://localhost:8080/ar-bloodbank/donor")
    const jsonData = await response.json()
   var tableBodyElement = document.getElementById("donor-table-rec")
    console.log(jsonData)
   for(var i = 0 ; i < jsonData["data"].length ; i++){

        const item = jsonData["data"][i]

        tableBodyElement.innerHTML += 
        // vvvvvvvvvvvvvv important
            //       `          is a tilde operator/symbol

        `
        <tr>
        <td>${i+1}</td>
        <td>${item.donor_id}</td>
        <td>${item.name}</td>
        <td>${item.amount}</td>
        <td class="action-button" id=${item.donor_id} onclick='getBloodDialog(${JSON.stringify(item)})'><i class="fas fa-pencil"></i></td>
        </tr>
        `
   }
}

function removeBlackScreen(){

    const screen = document.getElementById("screen-1")

    screen.style.display = ""

}



window.onload = function(){

    path = window.location.pathname

    // below code is done to run the fetchDonors function only when we are in receivers page

    // if we are not in receivers page, then run the code of rendering admin icon
    path === '/pages/receiver.html' ? fetchDonors() : renderAdminIcon()

}

function renderAdminIcon(){
    const adminIcon = document.getElementsByClassName("admin-button")[0]
    
    path = window.location.pathname

    adminIcon.style.display = (path === '/' ? "block": "")
}

function goToAdminLogin(){
    window.location.href = "/pages/admin-login.html"
}