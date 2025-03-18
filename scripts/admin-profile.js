
window.onload = function () {


    showPendingReceiversList()


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
            }

        })


    /**
     * 
     *  <div class="card">

          <h2>Receiver's Name : <span class="highlight">Transformers</span></h2>

          <p>📞 Phone: <span class="highlight">9399982755</span></p>
          <p>📧 Email: <span class="highlight">valsala@gmail.com</span></p>
          <p>🆔 Aadhar: <span class="highlight">238502615049</span></p>

          <p>🩸 Blood Group Needed: <span class="highlight">AB-</span></p>
          <p>📦 Quantity: <span class="highlight">400.0 ml</span></p>

          <p>Status:
            <span class="status pending">Pending</span>
          </p>

          <div class="footer">
            <span>📅 Requested on: <strong>2025-03-01 18:50:23</strong></span>
            <span>#ID No: <strong>3</strong></span>
          </div>
        </div>
     */
}

function showReceiversHistory() {
    fetch("http://localhost:8080/bloodbank/rhistory")
        .then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data)
        })
}