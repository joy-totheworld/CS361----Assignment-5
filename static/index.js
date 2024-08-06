var addButtons = []
addButtons = document.getElementsByClassName("add-class-button")

// referenced stack overflow for this loop: 
// https://stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
for (var i = 0; i < addButtons.length; i += 1) {
    (function () {
        currButton = addButtons[i]
        currButton.addEventListener("click", function () { showModal(); }, false);
    }());
}

const closeButton = document.getElementById("exit-modal-button")
closeButton.addEventListener("click", hideModal)
const closeDetailButton = document.getElementById("exit-detail-button")
closeDetailButton.addEventListener("click", hideDetailModal)
const closeButtonNotification = document.getElementById("exit-notification-button")
closeButtonNotification.addEventListener("click", hideNotificationModal)
const contButtonNotification = document.getElementById("continue-button")
contButtonNotification.addEventListener("click", hideNotificationModal)
const selectionButton = document.getElementById("submit-selection-button")
selectionButton.addEventListener("click", addSelections)
const selectionRemoveButton = document.getElementById("remove-button")
selectionRemoveButton.addEventListener("click", removeSelection)

const submitButton = document.getElementById("submit-button")
submitButton.addEventListener("click", displayWarning)


function Class(courseID, courseName, prereqs) {
    this.courseID = courseID;
    this.courseName = courseName;
    this.prereqs = prereqs;
}

function removeSelection (){
    var removalID = document.getElementById("detail-text-container").getElementsByTagName("h3")[0].textContent
    var allPlanned = document.getElementsByClassName("planned-class")
    var removalIdx = -1
    var removalnodeidx;
    console.log("removalID: ",removalID)

    for (var i = 0; i < allPlanned.length; i++) {
        console.log(allPlanned[i])
        if (allPlanned[i].dataset.id== removalID) {
            console.log("found element to remove: ", allPlanned[i])
            removalIdx = allPlanned[i].dataset.parentidx
        }
    }

    var parentContainer = document.getElementsByClassName("term")[removalIdx].getElementsByClassName("vertical-button-container")[0]
    console.log(parentContainer.childNodes)
    for (var j = 0; j < parentContainer.childNodes.length; j++) {
        // console.log(parentContainer.childNodes[j])
        // console.log("parentContainer[j].nodeName",((parentContainer.childNodes[j]).nodeName))
        if (parentContainer.childNodes[j].nodeName == "BUTTON") {
            if (parentContainer.childNodes[j].className == "planned-class") {
                if (parentContainer.childNodes[j].dataset.id == removalID) {
                    removalnodeidx = j
                    console.log(removalIdx)
                }
            }
        }
    }

    parentContainer.removeChild(parentContainer.childNodes[removalnodeidx])
    

    hideDetailModal()
}

function addSelections() {

    var openTerm = document.getElementById('term-selection');
    var addedClass = document.getElementById('class-input');
    // console.log(addedClass.value)

    var selectedClass;
    var classDiv = document.createElement("button")

    div = document.getElementById("brow");
    allClassOptions = div.getElementsByTagName("option");
    for (var i = 0; i < allClassOptions.length; i++) {
        if (allClassOptions[i].value == addedClass.value) {
            selectedClass = allClassOptions[i]
            console.log(selectedClass)
        }
    }

    if ((typeof selectedClass == "undefined")||(typeof openTerm.selectedIndex == "undefined")) {
        var errorContainer = document.getElementById('error-container')
        var errorNotice = document.createElement("p")
        errorNotice.classList.add("error-message")
        errorNotice.innerHTML = "Error: Both input fields must be populated to submit."
        errorContainer.appendChild(errorNotice)
    } else {
    
        var parentidx = -1
        var openTermID = openTerm.options[openTerm.selectedIndex].value
    
        var selectedTermContainer;
        termContainers = document.getElementsByClassName("term")
        for (var i = 0; i < termContainers.length; i++) {
            if (termContainers[i].dataset.id == openTermID) {
                selectedTermContainer = termContainers[i]
                parentidx = i
                // console.log("selected term container: ", selectedTermContainer)
            }
        }
        selectedTermContainer = selectedTermContainer.getElementsByClassName("vertical-button-container")[0]
    
        courseIdentfiers = selectedClass.value.split(",")
        // console.log("course ids: ", courseIdentfiers)
        var courseID = document.createElement("p")
        courseID.innerHTML = courseIdentfiers[0]
        var courseName = document.createElement("p")
        courseName.innerHTML = courseIdentfiers[1]
    
        classDiv.appendChild(courseID);
        classDiv.appendChild(courseName);
    
        classDiv.dataset.id = selectedClass.dataset.id;
        classDiv.dataset.name = selectedClass.dataset.name;
        classDiv.dataset.parentidx = parentidx
        classDiv.classList.add("planned-class");
        classDiv.addEventListener("click", function () {
            var detailTextContainer = document.getElementById("detail-text-container");
            var detailsID = document.createElement("h3")
            var detailsName = document.createElement("h3")
            var detailsPrereq = document.createElement("h3")
            var detailsIDHeader = document.createElement("p")
            var detailsNameHeader = document.createElement("p")
            var detailsPrereqHeader = document.createElement("p")
    
    
            console.log("allClasses: ", allClasses)
            // console.log(courseID.textContent)
            var classDetailArray;
            for (var i = 0; i < allClasses.length; i++) {
                if (allClasses[i][0] == courseID.textContent) {
                    classDetailArray = allClasses[i]
                    // console.log(allClasses[i])
                }
            }
            detailsIDHeader.innerHTML = "Subject and Course ID: "
            detailsID.innerHTML = classDetailArray[0]
            detailsNameHeader.innerHTML = "Class Name: "
            detailsName.innerHTML = classDetailArray[1]
            detailsPrereqHeader.innerHTML = "Prerequisites: "
            if (classDetailArray[2].length == 0) {
                detailsPrereq.innerHTML = "none"
            } else {
                detailsPrereq.innerHTML = unnestToString(classDetailArray[2])
            }
            detailTextContainer.appendChild(detailsIDHeader)
            detailTextContainer.appendChild(detailsID)
            detailTextContainer.appendChild(detailsNameHeader)
            detailTextContainer.appendChild(detailsName)
            detailTextContainer.appendChild(detailsPrereqHeader)
            detailTextContainer.appendChild(detailsPrereq)
            
            showDetails();
        }, false);
    
        // console.log(classDiv)
    

        selectedTermContainer.appendChild(classDiv);
    
        hideModal();
    }
}

function unnestToString(prereqArray) {
    var prereqString = ""

    if (prereqArray.length > 1) {
        for (var i = 0; i < (prereqArray.length - 1); i++) {
            if (Array.isArray(prereqArray[i])) {
                prereqString = prereqString + combineWithOr((prereqArray[i]))
            } else {
                prereqString = prereqString + prereqArray[i] + " and "
            }
        }
        if (Array.isArray(prereqArray[prereqArray.length - 1])) {
            prereqString = prereqString + combineWithOr((prereqArray[prereqArray.length - 1]))
        } else {
            prereqString = prereqString + " and " + prereqArray[prereqArray.length - 1]
        }
    } else {
        if (Array.isArray(prereqArray[prereqArray.length - 1])) {
            prereqString = combineWithOr((prereqArray[prereqArray.length - 1]))
        } else {
            prereqString = prereqArray[prereqArray.length - 1]
        }
    }



    return prereqString
}

function combineWithOr(prereqSubArray) {
    var prereqSubString = "("
    for (var i = 0; i < (prereqSubArray.length - 1); i++) {
        prereqSubString = prereqSubString + prereqSubArray[i] + " or "
    }
    prereqSubString = prereqSubString + " or " + prereqSubArray[prereqSubArray.length - 1] + ")"
    return prereqSubString
}

function addTermSelections() {
    terms = document.getElementsByClassName("term")

    for (var j = 0; j < terms.length; j += 1) {

        if ((typeof terms[j].getElementsByClassName("term-name")[0].value !== "undefined") && (typeof terms[j].getElementsByClassName("term-name")[1].value !== "undefined")) {
            var newTerm = document.createElement("option");
            names = terms[j].getElementsByClassName("term-name")
            // console.log(names)
            newTerm.value = names[0].value + " " + names[1].value
            newTerm.innerText = names[0].value + " " + names[1].value
            terms[j].dataset.id = names[0].value + " " + names[1].value
            newTerm.classList.add("dropdown-term")
            // console.log(newTerm)
            var classContainer = document.getElementById('term-selection');
            classContainer.appendChild(newTerm);
        }
    }
}



function addClass(courseID, courseName, prereqs) {
    allClasses.push([courseID, courseName, prereqs])

    var newClass = document.createElement("option");
    newClass.innerHTML = courseID + ", " + courseName;
    newClass.dataset.id = courseID;
    newClass.dataset.name = courseName;
    newClass.dataset.prereqs = prereqs;
    newClass.classList.add("dropdown-class")
    // console.log(newClass)
    // console.log(courseID.replace(" ", ""))

    var classContainer = document.getElementById('brow');
    classContainer.appendChild(newClass);
}



function getData(url, cb) {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(JSON.parse(result)));
}

var i = 0
var allClasses = []
getData("/classDataMTH", (data) => data.forEach((element) => addClass(element[0].courseID, element[0].courseName, element[0].prereqs)))
getData("/classDataCS", (data) => data.forEach((element) => addClass(element[0].courseID, element[0].courseName, element[0].prereqs)))
// console.log(allClasses)


// for (let i = 0; i < allClasses.length; i++) {
//     console.log(allClasses[i])

// }


function showModal() {
    // console.log("show Modal")
    var loadedTerms = document.getElementById("term-selection");
    while (loadedTerms.firstChild) {
        loadedTerms.removeChild(loadedTerms.lastChild);
    }
    var modal = document.getElementById('post-activity-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    addTermSelections()

    // modal.dataset.termidx = addButtons.dataset.idx
    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');

}

function hideModal() {
    var modal = document.getElementById('post-activity-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    modal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');

    var inputToClear = document.getElementById('class-input');
    inputToClear.value = ""
    var errorContainer = document.getElementById('error-container')
    while (errorContainer.firstChild) {
        errorContainer.removeChild(errorContainer.lastChild);
    }
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

function displayWarning() {
    var modal = document.getElementById('notification-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    var notificationTextContainer = document.getElementById("notification-text-container");
    var noticeHeader = document.createElement("h3")
    noticeHeader.textContent = "Warning: "
    var notice1 = document.createElement("p")
    notice1.textContent = "Once you submit this plan, you will no longer be able to revise it."
    var notice2 = document.createElement("p")
    notice2.textContent = "Would you still like to submit it?."
    var submit2 = document.createElement("button")
    submit2.textContent = "Submit"
    submit2.classList.add("confirm-submit")
    var cancelButton = document.getElementById("continue-button")
    cancelButton.textContent = "Cancel"
    var fill1 = document.createElement("p")
    var fill2 = document.createElement("p")

    notificationTextContainer.append(noticeHeader)
    notificationTextContainer.append(notice1)
    notificationTextContainer.append(notice2)
    notificationTextContainer.append(submit2)
    notificationTextContainer.append(fill1)
    notificationTextContainer.append(fill2)

    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
}

function hideDetailModal() {
    var modal = document.getElementById('detail-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    modal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');

    var detailTextContainer = document.getElementById("detail-text-container");
    while (detailTextContainer.firstChild) {
        detailTextContainer.removeChild(detailTextContainer.lastChild);
    }
}


function showDetails() {


    var modal = document.getElementById('detail-modal');
    var modalBackdrop = document.getElementById('modal-backdrop');

    addTermSelections()

    // modal.dataset.termidx = addButtons.dataset.idx
    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');

}