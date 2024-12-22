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

    
}