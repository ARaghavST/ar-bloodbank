window.onload = function(){

    const body = document.getElementsByTagName("body")[0]
    const dialogBox = document.getElementsByClassName("profile-dialog-box")[0]

    body.addEventListener('click',(event)=>{
        
        if (event.target.className == "profile-button" || event.target.className== "fas fa-user" ){
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

        const expiryTime = new Date(donorObj.expires_at)
        const currentTime = new Date()

        if (currentTime.getTime() > expiryTime.getTime()){
           

            window.location.replace("/pages/donor-login.html")
            localStorage.removeItem("donor")

            window.alert("Session expired! Login again")


            return
        }

        const donorData = donorObj

        const nameLabel = document.getElementById("donor-profile-name")
        const availabilityStringLabel = document.getElementById("donor-profile-availability")
        const availabilityToggle = document.getElementById("availability-toggle")
        const emergencyToggle = document.getElementById("emergency-toggle")

        const dateInput = document.getElementById('available-date-input');

        nameLabel.innerHTML=donorData.name

        if (donorData.availability === "NO"){
            availabilityStringLabel.innerHTML = "Your gift of blood can save lives. Keep your availability enabled and make a difference!"
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

        
        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10); // 7 days ahead

        dateInput.min = today.toISOString().split("T")[0];
        dateInput.max = maxDate.toISOString().split("T")[0];


        fetchAndDisplayDonationHistory()


    }else{
        window.location.replace("/pages/donor-login.html")
    }
}


function closeDialogBox(){

    const dialogBox = document.getElementsByClassName("overlay")[0]
    dialogBox.style.display='none';

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if(toUpdateFieldElement.innerHTML===""){
        return
    }

    if (toUpdateFieldElement.innerHTML == "AVAILABILITY"){
        document.getElementById("availability-toggle").checked = false
    }else{
        document.getElementById("emergency-toggle").checked = false
    }


}

function checkLoggedDonorTimeout(){
    var donor = localStorage.getItem("donor")

    if (donor){

        donorObj = JSON.parse(donor)

        const expiryTime = new Date(donorObj.expires_at)
        const currentTime = new Date()

        if (currentTime.getTime() > expiryTime.getTime()){
           

            window.location.replace("/pages/donor-login.html")
            localStorage.removeItem("donor")

            window.alert("Session expired! Login again")


            return true
        }
    }

    return false

}

function toggleAvailability(checkbox){

     if(checkLoggedDonorTimeout()){
        return
     }

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if(checkbox.checked){
        const dialogBox = document.getElementsByClassName("overlay")[0]

        toUpdateFieldElement.innerHTML = "AVAILABILITY"
        dialogBox.style.display='flex';
    }else{
        setUnavailableStatus("AVAILABILITY")
    }


}

function toggleEmergency(checkbox){

    if(checkLoggedDonorTimeout()){
        return
     }

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    if(checkbox.checked){
        const dialogBox = document.getElementsByClassName("overlay")[0]
        toUpdateFieldElement.innerHTML = "EMERGENCY AVAILABILITY"
        dialogBox.style.display='flex';
    }else{
        setUnavailableStatus("EMERGENCY")
    }
}


function updateYesStatusSpinner(){
    const dialogBox = document.getElementsByClassName("update-status-dialog-box")[0]
    const spinnerBox = document.getElementsByClassName("spinner-parent-div")[0]
    const overlay = document.getElementsByClassName("overlay")[0]

    const toUpdateFieldElement = document.getElementById("status-update-field-name")

    dialogBox.style.display="none"
    spinnerBox.style.display="flex"

    var donor = localStorage.getItem("donor")    
    donorObj = JSON.parse(donor)

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
  
    fetch(`http://localhost:8080/bloodbank/donor/?id=${donorObj.id}`,{
        method : 'PUT',
        body : JSON.stringify(updateBody)
    }).then((response)=>{
        return response.json()
    }).then((data)=>{

        overlay.style.display = "none"
        
        if (toUpdateFieldElement.innerHTML == "AVAILABILITY"){
            donorObj["availability"]="YES"
        }else{
            donorObj["e_ready"]=1
        }

        localStorage.setItem("donor",JSON.stringify(donorObj))


        window.location.reload(true)



    }).catch((err)=>{
        console.log(err)
    })

}

function setUnavailableStatus(toUpdateValue){

    var toUpdateBody = {}

    if (toUpdateValue === "AVAILABILITY"){

        toUpdateBody = {
            "availability":"NO"
        }

    }else{

        toUpdateBody = {
            "e_ready":"0"
        }

    }

    fetch(`http://localhost:8080/bloodbank/donor/?id=${donorObj.id}`,{
        method : 'PUT',
        body : JSON.stringify(toUpdateBody)

    }).then((response)=>{
        
        return response.json()

    }).then((data)=>{
        
        if (toUpdateValue == "AVAILABILITY"){
            donorObj["availability"]="NO"
        }else{
            donorObj["e_ready"]=0
        }

        localStorage.setItem("donor",JSON.stringify(donorObj))


        window.location.reload(true)



    }).catch((err)=>{
        console.log(err)
    })
}


function fetchAndDisplayDonationHistory(){

    const historyItemsContainer = document.getElementById("donation-history-items")
    const historyContainerLoader = document.getElementById("history-items-loader")
    const noHistoryFoundLabel = document.getElementById("no-records-found-label")

    fetch(`http://localhost:8080/bloodbank/donor/?id=${donorObj.id}`)
    .then((response)=>{
        return response.json()

    }).then((data)=>{

        historyContainerLoader.style.display = "none"

        if (data.data.length === 0 ){
            
            noHistoryFoundLabel.style.display = "block"

        }else{

            for(var i = 0 ; i< data.data.length ; i++){

                const item = data.data[i]

                const timeString = item.donation_time

                // These lines make date from 2025-03-17 to 17 March 2025
                const dateObject = new Date(timeString.split(" ")[0]);

                // Define options for formatting
                const options = { day: '2-digit', month: 'long', year: 'numeric' };

                // Create an Intl.DateTimeFormat object with the desired locale and options
                const formatter = new Intl.DateTimeFormat('en-GB', options);

                // Format the date
                const formattedDate = formatter.format(dateObject);


                // These functions make time from 13:00:00 to 01:00 PM

                let [hours, minutes, seconds] = timeString.split(" ")[1].split(':').map(Number);

                // Determine AM or PM suffix
                const period = hours >= 12 ? 'PM' : 'AM';
            
                // Convert hours from 24-hour to 12-hour format
                hours = hours % 12 || 12; // Converts '0' or '12' to '12'
            
                // Format minutes to always be two digits
                minutes = minutes.toString().padStart(2, '0');
            
                // Return formatted time without seconds
                const formattedTime = `${hours}:${minutes} ${period}`;



                historyItemsContainer.innerHTML += `
                <div class="history-card">
                <div class="blood-icon">🩸</div>
                <div class="history-details">
                  <p class="info">🗓️ <span>Date:</span> ${formattedDate}</p>
                  <p class="info">⏰ <span>Time:</span> ${formattedTime}</p>
                  <p class="info">💉 <span>Amount Donated:</span> ${item.quantity} mL</p>
                  <p class="info">⚖️ <span>Weight:</span> ${item.weight} kg</p>
                </div>
                </div>`

        }
    }

    })
}


function showUpdatePasswordDialogBox(){
    
    const updateStatusDiv = document.getElementsByClassName("status-update-box")[0]
    const updatePasswordDiv = document.getElementsByClassName("password-update-box")[0]
    
    const dialogBox = document.getElementsByClassName("overlay")[0]
    dialogBox.style.display='flex';

    updatePasswordDiv.style.display="flex"
    updateStatusDiv.style.display="none"

}

function changePassword(){
    
    
    const newPassword = document.getElementById("new-password-input").value


    var toUpdateBody = {
        "password":newPassword
    }


    fetch(`http://localhost:8080/bloodbank/donor/?id=${donorObj.id}`,{
        method : 'PUT',
        body : JSON.stringify(toUpdateBody)

    }).then((response)=>{
        
        return response.json()

    }).then((data)=>{
    
        closeDialogBox()
        window.alert("Password changed successfully!")
        

    }).catch((err)=>{
        console.log(err)
    })

}

function logoutDonorProfile(){
    localStorage.removeItem("donor")
    window.location.replace("/pages/donor-login.html")
}


function openDonationConfirmationDialog(){
    const updateStatusDiv = document.getElementsByClassName("status-update-box")[0]
    const updatePasswordDiv = document.getElementsByClassName("password-update-box")[0]
    const donationDiv = document.getElementsByClassName("donate-now-box")[0]
    
    const overlay = document.getElementsByClassName("overlay")[0]
    overlay.style.display='flex';

    updatePasswordDiv.style.display="none"
    updateStatusDiv.style.display="none"
    donationDiv.style.display="block"

}