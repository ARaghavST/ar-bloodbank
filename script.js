const BLOODBANK_BACKEND_URL="https://ar-bloodbank-backend.onrender.com/bloodbank-1.0"
const LOCAL_BACKEND_URL="http://localhost:8080/bloodbank"


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


async function userLogin() {

    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    /* Like Dictionaries in Python
     Used for data protection */
    const data = {
        "email": emailField.value,
        "password": passwordField.value
    }

    const loginLockDiv = document.getElementsByClassName("login-lock-div")[0]
    const loginSpinner = document.getElementsByClassName("spinner-parent-div")[0]

    loginLockDiv.style.setProperty("display", "none", "important")
    loginSpinner.style.setProperty("display", "flex", "important")



    fetch(`${LOCAL_BACKEND_URL}/donor/login`,{
        
        method:'POST',
        
        body:JSON.stringify(data)
    
    }).then((response)=>{

       return response.json()

    }).then((data)=>{
       
        if(data.error){
            loginLockDiv.style.setProperty("display", "flex", "important")
            loginSpinner.style.setProperty("display", "none", "important")

            // will send notification here
        }else{
            window.location.href="/pages/donor-profile.html"
        }
    })


    // This data will be sent to java backend


}


// for donor-signup html
// Used to show mobile number every time user enters a number, and to check mobile number do not exeeds 10 digits
const mobileTextBox = document.getElementById("signup-mobile-text") 

const receiverPhno = document.getElementById("receiver-phno")

receiverPhno ? receiverPhno.addEventListener('input', function (event) {

    const mobileNumber = event.target.value

    if (mobileNumber.length > 10) {
        window.alert('Mobile number cannot exceed 10 digits')
        receiverPhno.value = mobileNumber.substring(0, 10)
    }

}) : ''


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

    var e_available = document.querySelector('input[id="e_check"]:checked')? 1 : 0

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
        "gender": gender[0],
        "bloodgroup": bloodGroup,
        "e_ready":e_available
    }


    console.log(signupData)


    fetch(`${LOCAL_BACKEND_URL}/donor/`,{
        
        method:'POST',
        
        body:JSON.stringify(signupData)
    
    }).then((response)=>{

       return response.json()

    }).then((data)=>{
       
       if(!data.error){
            window.location.reload(true)
            window.alert("You are signed up")
            // notification for error and success signup
       }
    })



    // This signupdata will be sent to java backend

}


/** Script for receiver.html page load */

/** The HTML code for creation of table is present in script.js line no. 189 - 195 */


function removeBlackScreen(){

    const screen = document.getElementById("screen-1")

    screen.style.display = ""

}



window.onload = function(){

    path = window.location.pathname

    // below code is done to run the fetchDonors function only when we are in receivers page

    // if we are not in receivers page, then run the code of rendering admin icon
    if (path === '/pages/receiver.html'){

        const bloodDrops = document.getElementsByName("blood_type")

        
        for( var i = 0 ; i < bloodDrops.length ; i++){

            const drop = bloodDrops[i]

            drop.addEventListener(('click'),()=>{
                handleBloodTypeClick(drop)
            })
                 
        }

        // bloodDrops.forEach((element)=>{
        //     element.addEventListener(('click'),()=>{
        //         handleBloodTypeClick(element)
        //     })
        //     console.log(element)
        // })



    }

    renderAdminIcon()

    
    // if we are in admin-login page, then run the code of checking admin data from localstorage in browser, to retain logged in admin
    path === '/pages/admin-login.html' ? checkAdminLogin() : ""

}






function renderAdminIcon(){
    const adminIcon = document.getElementsByClassName("admin-button")[0]
    
    path = window.location.pathname
    adminIcon.style.display = (path === '/' || path === '/index.html' ? "block" : "")
}

function goToAdminLogin(){
    window.location.href = "/pages/admin-login.html"
}


/**
 * 
 * receiver page
 * 
 */

function processBloodSlider(slider,maxValue){
    const bloodTextBox = document.getElementById("bloodInput")
    const receiveBloodFill = document.getElementsByClassName("receive-blood")

    // line 221 -> line 223 , means we are restricting slider not to go more than max value
    if (slider.value > maxValue) {
        slider.value = maxValue
    }

    var fillHeight = (slider.value / 1000)*  100;


    //  receiveBloodFill[0] denotes the element , because receiveBloodFill in array of elements
    receiveBloodFill[0].style.height = `${fillHeight}%`
    
    bloodTextBox.value = slider.value
}


function processBloodInputText(textbox,maxValue){

    const slider = document.getElementById("bloodSlider")
    const receiveBloodFill = document.getElementsByClassName("receive-blood")

    if (textbox.value > maxValue){
        textbox.value = maxValue
    }

    var fillHeight = (textbox.value/1000)*100;

    receiveBloodFill[0].style.height = `${fillHeight}%`

    slider.value = textbox.value
}


function submitAndShowSecondCard(){
    
    const bloodGroups = document.getElementsByClassName("selected-blood")

    if (bloodGroups.length == 0){
        window.alert('Please select a blood group')
        return
    }
    
    const carousel = document.getElementsByClassName("carousel")
    
    // below line will store the selected blood group 
    var selectedBloodGroup = bloodGroups[0].innerHTML

    // below line will store the amount of blood chosen
    const bloodAmount = document.getElementById("bloodInput").value


    const bloodAmountLabel = document.getElementById("blood-amount")
    const bloodTypeLabel = document.getElementById("blood-group")

    bloodAmountLabel.innerHTML = bloodAmount
    bloodTypeLabel.innerHTML = selectedBloodGroup

    carousel[0].style.transform = 'translateX(-620px)';

    var bloodRequiredTitle = document.getElementsByClassName("blood-required-title")
    bloodRequiredTitle[0].style.display="none"
}

function handleBloodTypeClick(clickedElement){

    const bloodTypes = document.getElementsByName("blood_type")

    const carousel = document.getElementsByClassName("carousel")


    for( var i = 0 ; i < bloodTypes.length ; i++){
        const drop = bloodTypes[i]
        
        if (drop == clickedElement && !drop.classList.contains("not-available-blood")){
            // if current element is the one we clicked
            drop.classList.add("selected-blood")
        }else{
            drop.classList.remove("selected-blood")
        }
    }

    // bloodTypes.forEach((item)=>{
    //     if (item == clickedElement){
    //         item.classList.add("selected-blood")
    //     }else{
    //         item.classList.remove("selected-blood")
    //     }
    // })
    
}


function goToReceiverChild2Card(){
    const carousel = document.getElementsByClassName("carousel")
    carousel[0].style.transform = 'translateX(0px)';

     var bloodRequiredTitle = document.getElementsByClassName("blood-required-title")
    bloodRequiredTitle[0].style.display="block"
}

function handleAadharFormat(aadharTextBox){

    var text = aadharTextBox.value

    // split text by '-' and join with empty space
    var aadharInNumber = text.split("-").join('')

    if (aadharInNumber.length % 4 === 0 && aadharInNumber.length !== 0 && aadharInNumber.length != 12){
        text += '-'
    }
    aadharTextBox.value=text

}


function submitGetBloodForm(){
    const receiverName = document.getElementById("receiver-name").value
    const receiverPhno = document.getElementById("receiver-phno").value
    const receiverEmail = document.getElementById("receiver-email").value
    const receiverAadhar = document.getElementById("receiver-aadhar").value


    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(receiverEmail)) {
        window.alert('Email format invalid');
        document.getElementById("receiver-email").value = "";
    }

    var hyphenRemovedString = receiverAadhar.split("-").join('')

    if (!validateAadhaarNumber(hyphenRemovedString)){
        window.alert('Aadhar number invalid');
        document.getElementById("receiver-aadhar").value = "";
    }

    
}

/**
 * receiver page end
 * 
 */

/**
 * Admin login page 
 * 
 */

async function adminLogin(){
    const emailText = document.getElementById("admin-email")
    const passwordText = document.getElementById("admin-password")

    const loginData = {
        "email":emailText.value,
        "password":passwordText.value
    }

   const response = await fetch(`${BLOODBANK_BACKEND_URL}/admin`,{
        method:'POST',
        body:JSON.stringify(loginData)
    })

    const data = await response.json()

    const adminLoginForm = document.getElementById("admin-login-form")
    const adminUsersDiv = document.getElementById("admin-list-users")
    
    if (data['data']){

        localStorage.setItem("admin",JSON.stringify(data['data']))

        adminLoginForm.style.display="none" 
        adminUsersDiv.style.display="block"
    }else{
        // notification popup
        console.log(data['message'])
    }

}

/** Script for admin-login page */

function showAdminPassword() {
    const passwordField = document.getElementById("admin-password");
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

function checkAdminLogin(){

    var data = localStorage.getItem("admin")
    const adminLoginForm = document.getElementById("admin-login-form")
    const adminUsersDiv = document.getElementById("admin-list-users")
    
    if (data){
        adminLoginForm.style.display="none"
        adminUsersDiv.style.display="block"

        fetchStatusZeroUsers()

    }else{
        
    }

}

async function fetchStatusZeroUsers(){
    const response = await fetch(`${BLOODBANK_BACKEND_URL}/admin`)

    const users = await response.json()
    // console.log(users)

    const tableBodyElement = document.getElementById("status-zero-users-table")

    for(var i = 0 ; i < users['data'].length ; i++){

        const item = users['data'][i]

        tableBodyElement.innerHTML += 
        // vvvvvvvvvvvvvv important
            //       `          is a tilde operator/symbol

        `
        <tr>
        <td>${i+1}</td>
        <td>${item.name}</td>
        <td>${item.dob}</td>
        <td>${item.gender}</td>
        <td>${item.mobile}</td>
        <td class="action-button" id=${i+1} onclick='adminShowRegUserDialogBox(${JSON.stringify(item)})'><i class="fas fa-pencil"></i></td>
        </tr>
        `
   }
}

function adminShowRegUserDialogBox(item){
    const blackScreen = document.getElementById("screen-1")
    const dialogbox = document.getElementById("details-dialog-box")

    const nameDiv = document.getElementById("admin-donor-name-div")


    // we check empty condition , because initally we set the display of "screen-1" (id) as none - IN CSS
    if (blackScreen.style.display == ""){
        blackScreen.style.display = "block"
    }


    const adminSubmitDonorButton = document.getElementById("admin-submit")
    // we have added one click listener to submit donor button in admin page
    // we have done this because, we need sno field of donor everytime we click on submit button , to send update row in table with that sno field
    adminSubmitDonorButton.addEventListener("click",()=>{
        adminSubmitDonor(item.sno)
    },{once:true})


    const adminRejectDonorButton = document.getElementById("admin-reject")

    adminRejectDonorButton.addEventListener("click",()=>{
        adminRejectDonor(item.sno)
    },{ once: true })



    nameDiv.innerHTML = item.name

}   


async function adminSubmitDonor(sno){
    
    const bloodText = document.getElementById("admin-blood-amount-input")
    const listbox = document.getElementById("admin-listbox-bg")
    let bloodGroup;

    var listLength = listbox.options.length
    for (var i = 0; i < listLength; i++) {
        if (listbox.options[i].selected) {
            bloodGroup = listbox.options[i].value;
        }
    }

    const submitData = {
        "amount":parseFloat(bloodText.value),
        "blood_group":bloodGroup,
        "sno":parseInt(sno)
    }

    // console.log("For id ",id)
    

    // we will send this to api
    const response = await fetch(`${BLOODBANK_BACKEND_URL}/admin`,{
        method: 'PUT',
        headers:{
            'Content-type': 'application/json'
       },
        body:JSON.stringify(submitData),
      
    })

    const res = await response.json();

    console.log(res);

}


function adminRejectDonor(sno){
    const toDeleteDonor = {
        "sno":sno
    }

    console.log(toDeleteDonor)
}


/********************** Aadhar validation logics ******/


function validateAadhaarNumber(aadhaar) {
    // Regular expression to check if the Aadhaar number is exactly 12 digits
    const aadhaarRegex = /^\d{12}$/;
    
    if (!aadhaarRegex.test(aadhaar)) {
        return false; // Aadhaar number must be 12 digits
    }
    
    return isValidVerhoeff(aadhaar);
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
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

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
    [9, 6, 3, 5, 8, 1, 4, 7, 2, 0]
];

const verhoeffTableInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function isValidVerhoeff(aadhaar) {
    let checksum = 0;
    let reversedArray = aadhaar.split("").reverse().map(Number);

    for (let i = 0; i < reversedArray.length; i++) {
        checksum = verhoeffTableD[checksum][verhoeffTableP[i % 8][reversedArray[i]]];
    }

    return checksum === 0;
}