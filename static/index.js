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
const selectionButton = document.getElementById("submit-selection-button")
selectionButton.addEventListener("click", addSelections)


function Class(courseID, courseName, prereqs) {
    this.courseID = courseID;
    this.courseName = courseName;
    this.prereqs = prereqs;
}

function addSelections() {

    var addedClass = document.getElementById('class-input');
    console.log(addedClass.value)

    var selectedClass;
    var classDiv = document.createElement("div")

    div = document.getElementById("brow");
    allClassOptions = div.getElementsByTagName("option");
    for ( var i = 0; i < allClassOptions.length; i++) {
        if (allClassOptions[i].value == addedClass.value) {
            selectedClass = allClassOptions[i]
            console.log(selectedClass)
        }
    }

    courseIdentfiers = selectedClass.value.split(",")
    console.log("course ids: ", courseIdentfiers)
    var courseID = document.createElement("p")
    courseID.innerHTML = courseIdentfiers[0]
    var courseName = document.createElement("p")
    courseName.innerHTML = courseIdentfiers[1]
    
    classDiv.appendChild(courseID);
    classDiv.appendChild(courseName);

    classDiv.dataset.id = selectedClass.dataset.id;
    classDiv.dataset.name = selectedClass.dataset.name;
    classDiv.classList.add("planned-class");

    console.log(classDiv)

    var openTerm = document.getElementById('term-selection');
    var openTermID = openTerm.options[openTerm.selectedIndex].value

    var selectedTermContainer;
    termContainers = document.getElementsByClassName("term")
    for ( var i = 0; i < termContainers.length; i++) {
        if (termContainers[i].dataset.id == openTermID) {
            selectedTermContainer = termContainers[i]
            console.log("selected term container: ", selectedTermContainer)
        }
    }

    selectedTermContainer.appendChild(classDiv);

    hideModal()

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
    var newClassObj = Class(courseID, courseName, prereqs);
    allClasses.push(newClassObj)

    var newClass = document.createElement("option");
    newClass.innerHTML = courseID + ", " + courseName;
    newClass.dataset.id = courseID;
    newClass.dataset.name = courseName;
    newClass.dataset.prereqs = prereqs;
    newClass.classList.add("dropdown-class")
    console.log(newClass)
    console.log(courseID.replace(" ", ""))

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
console.log(allClasses)


for (let i = 0; i < allClasses.length; i++) {
    console.log(allClasses[i])

}


function showModal(sourceButton) {
    console.log("show Modal")
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
    modal.dataset.termidx = "";

    var loadedTerms = document.getElementById("term-selection");
    while (loadedTerms.firstChild) {
        loadedTerms.removeChild(loadedTerms.lastChild);
    }
}
