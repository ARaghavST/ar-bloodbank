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

            localStorage.setItem("donor",JSON.stringify(data))


            window.location.href="/pages/donor-profile.html"

            

        }
    }).catch((err)=>{

         // will send notification here

        loginLockDiv.style.setProperty("display", "flex", "important")
        loginSpinner.style.setProperty("display", "none", "important")
    })


    // This data will be sent to java backend


}

