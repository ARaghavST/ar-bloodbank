


window.onload = function () {

    const adminDataString = localStorage.getItem("admin")

    if (!adminDataString){
        window.location.replace("/pages/admin-login.html")
    }
    
    const adminJson = JSON.parse(adminDataString)

    const expiryTime = new Date(adminJson.expires_at)
    const currentTime = new Date()

  
    console.log(currentTime.getTime() )
    console.log(expiryTime.getTime())

    if (currentTime.getTime() > expiryTime.getTime()){
      
        localStorage.removeItem("admin")

        window.location.replace("/pages/admin-login.html")
        

        window.alert("Session expired! Login again")


        return
    }




    showPendingReceiversList()


}

function logoutAdminProfile(){
    
    localStorage.removeItem("admin")
    window.location.replace("/pages/admin-login.html")
}


function switchTab(clickedDiv) {

    const tabs = document.getElementsByClassName("profile-tabs")

    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i] === clickedDiv) {
            tabs[i].classList.add("selected-tab")
        } else {
            tabs[i].classList.remove("selected-tab")
        }
    }



}


function switchSectionTab(clickedDiv) {

    const tabs = document.getElementsByClassName("section-tab")

    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i] === clickedDiv) {
            tabs[i].classList.add("selected-section-tab")
        } else {
            tabs[i].classList.remove("selected-section-tab")
        }
    }

    const selectedSectionTab = document.getElementsByClassName("selected-section-tab")[0]

    if (selectedSectionTab.innerHTML === "Approval List") {
        showPendingReceiversList()
    } else {
        showReceiversHistory()
    }



}



function showReceiversHistory() {
    fetch("http://localhost:8080/bloodbank/rhistory")
        .then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data)
        })
}


var currentIndex = 0
var maxIndex = 0 


function showPendingReceiversList() {

    const receiversContainer = document.getElementById("receivers-data")
    const loader = document.getElementById("receivers-items-loader")
    const noReceiversLabel = document.getElementById("no-records-found-label")

    fetch("http://localhost:8080/bloodbank/admin?usertype=receivers")
        .then((response) => {
            return response.json()
        }).then((data) => {

            if (data.data.length === 0) {
                noReceiversLabel.style.display = "flex"
            }else{
                maxIndex = data.data.length - 1;
            }
            loader.style.display = "none"

            for (var i = 0; i < data.data.length; i++) {
                let item = data.data[i]

                receiversContainer.innerHTML += `
                <div class="card">
                    <h2>Receiver's Name : <span class="highlight">${item.name}</span></h2>
                    <p>📞 Phone: <span class="highlight">${item.phno}</span></p>
                    <p>📧 Email: <span class="highlight">${item.email}</span></p>
                    <p>🆔 Aadhar: <span class="highlight">${item.aadhar}</span></p>
                    <p>🩸 Blood Group Needed: <span class="highlight">${item.bg_needed}</span></p>
                    <p>📦 Quantity: <span class="highlight">${item.quantity} mL</span></p>
                    <div class="footer">
                        <span>📅 Requested on: <strong>${item.req_date}</strong></span>
                        <span>#ID No: <strong>${item.sno}</strong></span>
                    </div>
                </div>
                `

                maximumLength=data.data.length;
            }

        }).catch((err)=>{
            loader.style.display = "none"
            noReceiversLabel.style.display = "flex"

        })


}


function moveNext(){
    const carousel = document.getElementById("receivers-data")
    const rightThumb = document.getElementsByClassName("right-thumb")[0]
    const leftThumb = document.getElementsByClassName("left-thumb")[0]


    if (currentIndex < maxIndex){
        currentIndex++;
    }

    leftThumb.classList.remove("blocked-thumb")
    carousel.style.transform = `translateX(-${currentIndex*680}px)`

    if(currentIndex === maxIndex ){
        rightThumb.classList.add("blocked-thumb")
    }

}


function movePrevious(){

    const carousel = document.getElementById("receivers-data")
    const rightThumb = document.getElementsByClassName("right-thumb")[0]
    const leftThumb = document.getElementsByClassName("left-thumb")[0]

    if (currentIndex > 0){
        currentIndex--;
    }

    rightThumb.classList.remove("blocked-thumb")
    carousel.style.transform = `translateX(-${currentIndex*680}px)`
    
    if (currentIndex === 0){
        leftThumb.classList.add("blocked-thumb")
    }
    
    
}