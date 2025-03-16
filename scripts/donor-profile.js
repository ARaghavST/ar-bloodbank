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


function closeDialogBox(){

    const dialogBox = document.getElementsByClassName("overlay")[0]
    dialogBox.style.display='none';

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if (toUpdateFieldElement.innerHTML == "AVAILABILITY"){
        document.getElementById("availability-toggle").checked = false
    }else{
        document.getElementById("emergency-toggle").checked = false
    }


}

function toggleAvailability(checkbox){

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if(checkbox.checked){
        const dialogBox = document.getElementsByClassName("overlay")[0]

        toUpdateFieldElement.innerHTML = "AVAILABILITY"
        dialogBox.style.display='flex';
    }
}

function toggleEmergency(checkbox){
    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if(checkbox.checked){
        const dialogBox = document.getElementsByClassName("overlay")[0]
        toUpdateFieldElement.innerHTML = "EMERGENCY AVAILABILITY"
        dialogBox.style.display='flex';
    }
}

function updateStatusSpinner(){
    const dialogBox = document.getElementsByClassName("update-status-dialog-box")[0]
    const spinnerBox = document.getElementsByClassName("spinner-parent-div")[0]
    const overlay = document.getElementsByClassName("overlay")[0]

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    dialogBox.style.display="none"
    spinnerBox.style.display="flex"

    var donor = localStorage.getItem("donor")

    
    donorObj = JSON.parse(donor)
    const donorData = donorObj.data.data

    var updateBody = {}

    if (toUpdateFieldElement.innerHTML == "AVAILABILITY"){
        updateBody = {
            "availability":"YES"
        }
    }else{
        updateBody = {
            "e_ready":"1"
        }
    }

    console.log(updateBody)
  
    fetch(`http://localhost:8080/bloodbank/donor/?id=${donorData.id}`,{
        method : 'PUT',
        body : JSON.stringify(updateBody)
    }).then((response)=>{
        return response.json()
    }).then((data)=>{

        overlay.style.display = "none"
        console.log(data)
        window.location.reload(true)



    }).catch((err)=>{
        console.log(err)
    })

}