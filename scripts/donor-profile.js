window.onload = function(){

    const body = document.getElementsByTagName("body")[0]
    const dialogBox = document.getElementsByClassName("profile-dialog-box")[0]

    body.addEventListener('click',(event)=>{
        
        if (event.target.className == "profile-button" || event.target.className== "fas fa-user"){
            dialogBox.style.display = "flex"
        }else{
            dialogBox.style.display = "none"
        }
    })

}

