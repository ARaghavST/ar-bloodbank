function adminLogin(){
    const emailText = document.getElementById("admin-email")
    const passwordText = document.getElementById("admin-password")

    const loginLockDiv = document.getElementsByClassName("login-lock-div")[0]
    const loginSpinner = document.getElementsByClassName("spinner-parent-div")[0]

    loginLockDiv.style.setProperty("display", "none", "important")
    loginSpinner.style.setProperty("display", "flex", "important")

    const loginData = {
        "email":emailText.value,
        "password":passwordText.value
    }

    fetch("http://localhost:8080/bloodbank/admin",{
        method : 'POST',
        body : JSON.stringify(loginData)
    }).then((response)=>{
        return response.json()
    }).then((data)=>{


        if(data.error){
            loginLockDiv.style.setProperty("display", "flex", "important")
            loginSpinner.style.setProperty("display", "none", "important")
            return
        }

        const now = new Date(); // Get current date and time
        now.setMinutes(now.getMinutes() + 30); // Add 30 minutes
        
        adminSession = {
            "msg":"Logged In",
            "expires_at":now.toISOString()
        }
        
        localStorage.setItem("admin",JSON.stringify(adminSession))

        window.location.replace("/pages/admin-profile.html")
        

        
    }).catch((err)=>{
        loginLockDiv.style.setProperty("display", "flex", "important")
        loginSpinner.style.setProperty("display", "none", "important")
    })

}