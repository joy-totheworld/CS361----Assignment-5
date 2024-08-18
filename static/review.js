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
