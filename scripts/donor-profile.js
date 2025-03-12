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

    displayDonorData()


}


function displayDonorData(){
    var donor = localStorage.getItem("donor")

    if (donor){

        donorObj = JSON.parse(donor)

        const donorData = donorObj.data.data

        console.log(donorObj)
        const nameLabel = document.getElementById("donor-profile-name")
        const availabilityStringLabel = document.getElementById("donor-profile-availability")
        const availabilityToggle = document.getElementById("availability-toggle")
        const emergencyToggle = document.getElementById("emergency-toggle")

        nameLabel.innerHTML=donorData.name

        if (donorData.availability === "NO"){
            availabilityStringLabel.innerHTML = "Your gift of blood can save lives. Keep your availability updated and make a difference!"
            availabilityToggle.checked = false

        }else{
            availabilityStringLabel.innerHTML = "Your 'Yes' to our bloodbank gives others a second chance in life. Keep up the good work"
            availabilityToggle.checked = true
        }

        if (donorData.e_ready == 0){
            emergencyToggle.checked = false
        }else{
            emergencyToggle.checked = true
        }

        
        

    }
}

