function Class(courseID, courseName, prereqs) {
    this.courseID = courseID;
    this.courseName = courseName;
    this.prereqs = prereqs;
}

function addedClass(courseID, courseName, prereqs, idx) {
    this.courseID = courseID;
    this.courseName = courseName;
    this.prereqs = prereqs;
    this.parentIdx = idx
}

function Conjuction(arrayCon) {
    this.arrayCon = arrayCon
}

function Disjunction(arrayDis) {
    this.arrayDis = arrayDis
}

var savedReport = ''
const reportButton = document.getElementById("back-button")
reportButton.addEventListener("click", requestReport)
const closeButtonNotification = document.getElementById("exit-notification-button")
closeButtonNotification.addEventListener("click", hideNotificationModal)
const cancelButtonNotification = document.getElementById("continue-button")
cancelButtonNotification.addEventListener("click", hideNotificationModal)

function requestReport() {
    getData("/REQREPORT", (data) => saveReport(data))}

function getData(url, cb) {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(JSON.parse(result)));
}

function saveReport(reportInput) {
    savedReport = JSON.stringify(reportInput)
    displayReport()
}

function hideNotificationModal() {
    var modal = document.getElementById('notification-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    modal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');

    var notificationTextContainer = document.getElementById("notification-text-container");
    while (notificationTextContainer.firstChild) {
        notificationTextContainer.removeChild(notificationTextContainer.lastChild);
    }
}

function displayReport() {
    console.log(typeof savedReport)
    console.log(savedReport)
    // javascript:window.location.href='/review'
    var modal = document.getElementById('notification-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    var notificationTextContainer = document.getElementById("notification-text-container");
    var noticeHeader = document.createElement("h3")
    noticeHeader.textContent = "Generated Report: "
    var notice1 = document.createElement("p")
    notice1.textContent = savedReport

    var cancelButton = document.getElementById("continue-button")
    cancelButton.textContent = "Cancel"
    var fill1 = document.createElement("p")
    var fill2 = document.createElement("p")

    notificationTextContainer.append(noticeHeader)
    notificationTextContainer.append(notice1)
    notificationTextContainer.append(fill1)
    notificationTextContainer.append(fill2)

    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}
