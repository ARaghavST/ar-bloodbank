
let receiverDataArray=[]

window.onload = function () {

    const adminDataString = localStorage.getItem("admin")

    if (!adminDataString){
        window.location.replace("/pages/admin-login.html")
    }
    
    const adminJson = JSON.parse(adminDataString)

    const expiryTime = new Date(adminJson.expires_at)
    const currentTime = new Date()


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


function switchTab(clickedSection) {

    const tabs = document.getElementsByClassName("profile-tabs")
    const receiverSection = document.getElementById("receivers-section")
    const donorSection = document.getElementById("donors-section")

    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i] === clickedSection) {
            tabs[i].classList.add("selected-tab")
        } else {
            tabs[i].classList.remove("selected-tab")
        }
    }

    if(clickedSection.innerHTML === "Donors"){
        receiverSection.style.display = "none"
        donorSection.style.display = "flex"
    }else{
         receiverSection.style.display = "flex"
        donorSection.style.display = "none"
    }



}


var currentIndex = 0
var maxIndex = 0 


function showPendingReceiversList() {

    const rightThumb = document.getElementsByClassName("right-thumb")[0]
    const leftThumb = document.getElementsByClassName("left-thumb")[0]
    receiverDataArray=[]

    const receiversContainer = document.getElementById("receivers-data")
    const loader = document.getElementById("receivers-items-loader")
    const noReceiversLabel = document.getElementById("no-records-found-label")

    fetch("http://localhost:8080/bloodbank/admin?usertype=receivers")
        .then((response) => {
            return response.json()
        }).then((data) => {

            if(data.data){
                if (data.data.length === 0) {
                     // if we have no data in data array
                    // both thumbs are disabled
                    // we will show no receivers label
                    noReceiversLabel.style.display = "flex"
                    leftThumb.classList.add("blocked-thumb")
                    rightThumb.classList.add("blocked-thumb")

                }else{
                    maxIndex = data.data.length - 1;

                    if (data.data.length===1){
                         // if we have single data in data array
                        // both thumbs are disabled
                        leftThumb.classList.add("blocked-thumb")
                        rightThumb.classList.add("blocked-thumb")
                    }
                }
                loader.style.display = "none"
    
                for (var i = 0; i < data.data.length; i++) {
                    let item = data.data[i]
    
                    receiversContainer.innerHTML += `
                    <div class="card card-${item.sno} ${item.status === 1 ? "approved-receiver" : ""}" onclick="handleCardClick(${item.sno})">
                        ${item.status === 1 ? '<div id="approved-tag">APPROVED</div>' : ""}
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

                    receiverDataArray.push(item)
                }
            }else{
                // notification
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


   if (!rightThumb.classList.contains("blocked-thumb")){
    if (currentIndex < maxIndex){
        currentIndex++;
    }

    leftThumb.classList.remove("blocked-thumb")
    carousel.style.transform = `translateX(-${currentIndex*680}px)`

    if(currentIndex === maxIndex ){
        rightThumb.classList.add("blocked-thumb")
    }
   }

}


function movePrevious(){

    const carousel = document.getElementById("receivers-data")
    const rightThumb = document.getElementsByClassName("right-thumb")[0]
    const leftThumb = document.getElementsByClassName("left-thumb")[0]

    if(!leftThumb.classList.contains("blocked-thumb")){
        if (currentIndex > 0){
            currentIndex--;
        }
    
        rightThumb.classList.remove("blocked-thumb")
        carousel.style.transform = `translateX(-${currentIndex*680}px)`
        
        if (currentIndex === 0){
            leftThumb.classList.add("blocked-thumb")
        }
    }
    
    
}

function handleStatusCheckBox(selectedCheckbox){
    const checkboxs = document.getElementsByName("status_check")

    checkboxs.forEach(checkbox => {
        if (checkbox === selectedCheckbox){
            checkbox.checked = true
        }else{
            checkbox.checked = false
        }

    });
}

function showFiltersList(){

    const currentCaret = document.getElementsByClassName("default-caret")[0]
    
    if(!filtersApplied){
        currentCaret.classList.remove("default-caret")
    }

    const filtersSection = document.getElementsByClassName("filters-section")[0]

    if (currentCaret.classList.contains("fa-caret-up")){
        // means we will show list here
        const toShowCaret = document.getElementsByClassName("fa-caret-down")[0]
        
        
        toShowCaret.classList.add("default-caret")
        filtersSection.style.height = "100px"
        filtersSection.style.padding = "5px"


    }else{
        // we will hide list
        if(!filtersApplied){
            const toShowCaret = document.getElementsByClassName("fa-caret-up")[0]

            toShowCaret.classList.add("default-caret")

        setTimeout(()=>{
            filtersSection.style.padding = "0px"
           
        },(200))

         filtersSection.style.height = "0px"
        }
        
    }

}

var filtersApplied = false

// This function is called when ever filter is applied
function applyFilter(){
    
    
    // line 271 -> line 277 getting all HTML elements
    const receiversContainer = document.getElementById("receivers-data")
    const loader = document.getElementById("receivers-items-loader")
    const noReceiversLabel = document.getElementById("no-records-found-label")

    const carousel = document.getElementById("receivers-data")
    const rightThumb = document.getElementsByClassName("right-thumb")[0]
    const leftThumb = document.getElementsByClassName("left-thumb")[0]

    // Line 280 -> 284 : Getting filter values from input textbox and checkboxes 
    const nameToSearch = document.getElementById("receiver-name-search").value
    const bloodGroupCheckedboxes = document.getElementsByName("blood_group")
    const statusCheckedBoxes = document.getElementsByName("status_check")
    const dateFrom = document.getElementById("date_from").value
    const dateTo= document.getElementById("date_to").value

    let checkedBloodGroupString = ""
    let status = ""

    // making blood group as form of "B+,O+,..."
    bloodGroupCheckedboxes.forEach((checkbox)=>{
        if (checkbox.checked) {
            checkedBloodGroupString = checkedBloodGroupString + checkbox.value + ","
        }
    })

    // removing the last (extra) "," from the string , because it needs to be removed for JAVA backend to prepare MySQL query
    checkedBloodGroupString = checkedBloodGroupString.substring(0,checkedBloodGroupString.length-1)

    // this is for setting status 0 / 1
    statusCheckedBoxes.forEach((checkbox)=>{
        if(checkbox.checked){
            status = checkbox.value
        }
    })

    receiversContainer.innerHTML = ""
    
    // this is to make date from and to in form of "DD-MM-YYYY 00:00:00,DD-MM-YYYY 23:59:59", for MySQL query in backend
    let rangeOfDate = ""
    if (dateFrom && dateTo){
       rangeOfDate = dateFrom +" 00:00:00" + "," + dateTo + " 23:59:59"
    }

    receiverDataArray=[]
    // preparing the backend fetch url
    let url = `http://localhost:8080/bloodbank/admin?usertype=receivers&req_date_range=${rangeOfDate !== "" ? encodeURIComponent(rangeOfDate) : ""}&name=${nameToSearch}&status=${status}&bloodtype=${checkedBloodGroupString !== "" ? encodeURIComponent(checkedBloodGroupString) : ""}`

    // setting loader to be visible
    loader.style.display = "flex"

    fetch(url)
    .then((response) => {
        return response.json()
    }).then((data) => {

        
        if (data.data){
            // we have received some data in response

            // Line 330 : Is to set the carousel to start point , every time filter applied
            carousel.style.transform = `translateX(0px)`
            // Line 332 : Is to set the currentIndex i.e. index upto which earlier we have scrolled the card
            currentIndex = 0;


            if (data.data.length === 0) {
                // if we have nothing in data array i.e. no data present 
                
                // we will disable the thumbs
                leftThumb.classList.add("blocked-thumb")
                rightThumb.classList.add("blocked-thumb")

                noReceiversLabel.style.display = "flex"

            }else{
                maxIndex = data.data.length - 1;

                if (data.data.length === 1){
                    // if we have single data in data array
                    // both thumbs are disabled
                    leftThumb.classList.add("blocked-thumb")
                    rightThumb.classList.add("blocked-thumb")
                }else{

                    // if we have some data which is greater than 1, then make the thumbs UI as it was earlier i.e. left disabled , right enabled
                    leftThumb.classList.add("blocked-thumb")
                    rightThumb.classList.remove("blocked-thumb")
                }

                
            }
            // loader will be hidden , as we have got some response from backend
            loader.style.display = "none"
    
            for (var i = 0; i < data.data.length; i++) {
                let item = data.data[i]
    
                // appending data items into receiver data container ("receivers-data")
                
                receiversContainer.innerHTML += `
                <div class="card card-${item.sno} ${item.status === 1 ? "approved-receiver" : ""}" onclick="handleCardClick(${item.sno})">
                    ${item.status === 1 ? '<div id="approved-tag">APPROVED</div>' : ""}
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

                receiverDataArray.push(item)
    
                maximumLength=data.data.length;
            }
            // setting filters as true, 
            // this will help us to manage the filter dropdown functionality (line no. 225)
            filtersApplied = true
        }else{
            // the data key is not present in response
            // means we have some errors in response
            // we will give notification
        }

    }).catch((err)=>{

        // some error occured while calling api

        
        loader.style.display = "none"
        noReceiversLabel.style.display = "flex"

    })
    
}


function clearFilter(){
    window.location.reload(true)
}


function handleCardClick(targetReceiverId){
        
    const clickedCardData = receiverDataArray.find(receiver => receiver.sno === targetReceiverId)

    const clickedCard = document.getElementsByClassName(`card-${targetReceiverId}`)[0]
    const overlay = document.getElementsByClassName("overlay")[0]

    let dialogBoxReceiverId = document.getElementById("rec_id")
    let dialogBoxReceiverName = document.getElementById("rec_name")
    let dialogBoxReceiverBloodGroup = document.getElementById("rec_bg")
    let dialogBoxReceiverQuantity = document.getElementById("rec_amount")

    if(!clickedCard.classList.contains("approved-receiver")){
        overlay.style.display = "flex"

        dialogBoxReceiverId.innerHTML = "#"+targetReceiverId
        dialogBoxReceiverName.innerHTML = clickedCardData.name
        dialogBoxReceiverBloodGroup.innerHTML =clickedCardData.bg_needed
        dialogBoxReceiverQuantity.innerHTML =clickedCardData.quantity
    }

}

function handleCloseDialog(){
    const overlay = document.getElementsByClassName("overlay")[0]
        overlay.style.display = "none"
}

function handleApproveReceiver(){

    const updateStatusDialogBox = document.getElementsByClassName("update-status-dialog-box")[0]
    const spinnerParent = document.getElementsByClassName("spinner-parent-div")[0]
    const overlay = document.getElementsByClassName("overlay")[0]

    updateStatusDialogBox.style.display = "none"
    spinnerParent.style.display = "flex"

    const targetId = document.getElementById("rec_id").innerHTML.substring(1)

    console.log(targetId)

    fetch("http://localhost:8080/bloodbank/update-status?for=receiver",{
        method : 'PUT',
        body : JSON.stringify({
            "id" : targetId
        })
    })
    .then((response)=>{
        return response.json()
    }).then((data)=>{

        overlay.style.display = "none"

        setTimeout(()=>{
            window.location.reload(true)
        },400)
        if(data.data){

            window.alert("Approved")

        }else{
            // we will show notification
        }

    }).catch((err)=>{
        overlay.style.display = "none"
        // we will show notification again for error 
    })

}


/** Donor section js starts here */


function switchDonorRequestTab(clickedRequestTab){

    const requestTabs = document.getElementsByClassName("donor-request-tab")

    for(let i = 0 ; i < requestTabs.length ; i++){
        if (requestTabs[i] === clickedRequestTab){
            requestTabs[i].classList.add("selected-request-tab");
        }else{
            requestTabs[i].classList.remove("selected-request-tab");
        }
    }

    

}