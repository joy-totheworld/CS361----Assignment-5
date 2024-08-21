
const startButton = document.getElementById("start-button")
startButton.addEventListener("click", startProgram);

updateCourseData()

function startProgram() {
    clearPlan()
    javascript:window.location.href='planner'
}

function clearPlan() {
    fetch("/CLEARPLAN", {
        method: "POST",
    })
        .then(resp => {
            if (resp.status === 200) {
                return
            } else {
                console.log("Status: " + resp.status)
                return Promise.reject("server")
            }
        })
        .catch(err => {
            if (err === "server") return
            console.log(err)
        })
}

function updateCourseData() {
    fetch("/UPDATECOURSEDATA", {
        method: "POST",
    })
        .then(resp => {
            if (resp.status === 200) {
                return
            } else {
                console.log("Status: " + resp.status)
                return Promise.reject("server")
            }
        })
        .catch(err => {
            if (err === "server") return
            console.log(err)
        })
}