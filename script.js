
function onlyOne(checkbox) {

    var checkboxes = document.getElementsByName(checkbox.name)

    checkboxes.forEach((item) => {
        if (item !== checkbox) {
            item.checked = false
        }
    })

}


function submitClick(){
    var checkboxes = document.getElementsByName("chk")

    var checkedBox = null;

    checkboxes.forEach((item)=>{
        if(item.checked) {
            checkedBox=item;
        } 
    })


    switch (checkedBox.id) {
        case "chkd":
            window.location.href="/pages/donor.html";
            break;

        case "chkr":
            window.location.href="/pages/receiver.html";
            break;
    
        default:
            break;
    }

}


function onLogin(){
    window.location.href="/pages/donor-login.html"
}

function onSignUp(){
    window.location.href="/pages/donor-signup.html"
}


function showPassword(){
    const passwordField = document.getElementById("password");
    const togglePassword = document.querySelector(".password-toggle-icon i");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
      }

}


// for donor-login.html


function userLogin(){
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    const data = {
        "email":emailField.value,
        "password":passwordField.value
    }

    // This data will be sent to java backend

    
}


// for donor-signup html

const mobileTextBox = document.getElementById("signup-mobile-text")

mobileTextBox.addEventListener('input',function(event){

    const mobileNumber = event.target.value

    if (mobileNumber.length > 10){
        window.alert('Mobile number cannot exceed 10 digits')
        mobileTextBox.value=val.substring(0,10)
    }
    
})


function onClickAFT(){
    const name = document.getElementById("signup-name-text").value;
    const dob = document.getElementById("signup-dob-text").value;
    const mobile = document.getElementById("signup-mobile-text").value;
    const email = document.getElementById("signup-email-text").value;

    const gender = document.querySelector('input[name="gender"]:checked').value;

    const listbox = document.getElementById("listbox-bg");

    let bloodGroup;

    var listLength = listbox.options.length
    for(var i=0;i<listLength;i++){
       if(listbox.options[i].selected){
            bloodGroup = listbox.options[i].value;
       }
    }   


    const dateRegx =  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!dateRegx.test(dob)){
        window.alert("Invalid date format given. Input date in DD/MM/YYYY format")
        document.getElementById("signup-dob-text").value=""; 
    }
    

    if (!emailRegex.test(email)){
        window.alert('Email format invalid');
        document.getElementById("signup-email-text").value="";
    }

    const signupData = {
        "name":name,
        "dob":dob,
        "mobile":mobile,
        "email":email,
        "gender":gender,
        "bloodgroup":bloodGroup
    }



    // This signupdata will be sent to java backend

}