function Class(courseID, courseName, prereqs) {
    this.courseID = courseID;
    this.courseName = courseName;
    this.prereqs = prereqs;
}
  
function isEmpty(value) {
    return (value !== "");
}

function isBetter(value) {
    return (value.trim() !== "better");
}

function isConcurrent(value) {
    return (value.trim() !== "may be taken concurrently");
}

function isNotMathTest(value) {
    return (value.includes("ALEKS") == false);
}

function conjunctionCheckString(stringC) {
    processedForConjunctions = [stringC]

    if (typeof stringC == "string") {

        if (stringC.includes("and")) {

            console.log("contains and: ", stringC[q])
            console.log("and idx: ", stringC[q].indexOf("and"))
            console.log("str len: ", stringC[q].length)
            console.log("len - idx: ", stringC[q].length - stringC[l].indexOf("and"))

            if (stringC.split("and").filter(isEmpty).length > 1) {

                var split = stringC.split("and").filter(isEmpty)
                console.log("contains and (split): ", split)
                console.log("contains and (split): ", stringC)
                for (let u = 0; u < split.length; u++) {
                    split[u] = split[u].replace("with C-", "").trim()
                    split[u] = split[u].replace("with C", "").trim()
                    split[u] = split[u].replace("or better", "").trim()
                    split[u] = split[u].replace("[C-]", "").trim()
                    split[u] = split[u].replace("[C]", "").trim()
                    split[u] = disjunctionCheckString(split[u])
                }
                processedForConjunctions = split

            } else {
                console.log("found 'and' error, only given string, cannot split.")
            }
        } else {
            processedForConjunctions = disjunctionCheckString(processedForConjunctions)
        }
    }
    return processedForConjunctions;
}

function conjunctionCheckArray(stringC) {
    processedForConjunctions = []

    if (Array.isArray(stringC)) {
        arrayToDisjunctionCheck = [] 
        for (let q = 0; q < stringC.length; q++) {

            if (typeof stringC[q] == "string") {

                if (stringC[q].includes("and")) {

                    stringC[q] = stringC[q].replace("or better", "").trim()
                    stringC[q] = stringC[q].replace("with C-", "").trim()
                    stringC[q] = stringC[q].replace("with C", "").trim()
                    stringC[q] = stringC[q].replace("[C-]", "").trim()
                    stringC[q] = stringC[q].replace("[C]", "").trim()

                    console.log("contains and: ", stringC[q])
                    console.log("and idx: ", stringC[q].indexOf("and"))
                    console.log("str len: ", stringC[q].length)
                    console.log("len - idx: ", stringC[q].length - stringC[q].indexOf("and"))

                    if ((stringC[q] == " and ") || (stringC[q] == "and ") || (stringC[q] == " and") || (stringC[q] == "and")) {
                        req1 = stringC[q-1]
                        for (let m = 0; m < req1.length; m++) {
                            req1[m] = req1[m].replace("with C-", "").trim()
                            req1[m] = req1[m].replace("with C", "").trim()
                            req1[m] = req1[m].replace("or better", "").trim()
                            req1[m] = req1[m].replace("[C-]", "").trim()
                            req1[m] = req1[m].replace("[C]", "").trim()
                        }
                        req1 = disjunctionCheckArray(req1)
                        // console.log("req1: ", req1)

                        req2 = stringC[q+1]
                        for (let n = 0; n < req2.length; n++) {
                            req2[n] = req2[n].replace("with C-", "").trim()
                            req2[n] = req2[n].replace("with C", "").trim()
                            req2[n] = req2[n].replace("or better", "").trim()
                            req2[n] = req2[n].replace("[C-]", "").trim()
                            req2[n] = req2[n].replace("[C]", "").trim()
                        }
                        req2 = disjunctionCheckArray(req2)

                        processedForConjunctions.pop()
                        processedForConjunctions = processedForConjunctions.concat([req1,req2]);
                        arrayToDisjunctionCheck.pop()
                        arrayToDisjunctionCheck = arrayToDisjunctionCheck.concat([req1,req2]);
                        q++
                        console.log("arrayToDisjunctionCheck: ", arrayToDisjunctionCheck)


                    } else if ((stringC[q].length - stringC[q].indexOf("and")) < 5) {
                        beforeAnd = stringC[q].replace("and", "").trim()
                        beforeAnd = beforeAnd.replace("with C-", "").trim()
                        beforeAnd = beforeAnd.replace("with C", "").trim()
                        beforeAnd = beforeAnd.replace("or better", "").trim()
                        beforeAnd = beforeAnd.replace("[C-]", "").trim()
                        beforeAnd = beforeAnd.replace("[C]", "").trim()
                        beforeAnd = disjunctionCheckArray(beforeAnd)
                        console.log("beforeAnd", beforeAnd)

                        afterAnd = stringC[q + 1].replace("and", "").trim()
                        afterAnd = afterAnd.replace("with C-", "").trim()
                        afterAnd = afterAnd.replace("with C", "").trim()
                        afterAnd = afterAnd.replace("or better", "").trim()
                        afterAnd = afterAnd.replace("[C-]", "").trim()
                        afterAnd = afterAnd.replace("[C]", "").trim()
                        afterAnd = disjunctionCheckArray(afterAnd)
                        console.log("afterAnd: ", afterAnd)

                        processedForConjunctions = processedForConjunctions.concat([beforeAnd, afterAnd])
                        arrayToDisjunctionCheck = arrayToDisjunctionCheck.concat([beforeAnd, afterAnd]);


                    } else if (stringC[q].split("and").filter(isEmpty).length > 1) {
                        var split = stringC[q].split("and").filter(isEmpty)
                        console.log("contains and (split): ", split)
                        console.log("contains and (split): ", stringC)
                        for (let p = 0; p < split.length; p++) {
                            split[p] = split[p].replace("with C-", "").trim()
                            split[p] = split[p].replace("with C", "").trim()
                            split[p] = split[p].replace("or better", "").trim()
                            split[p] = split[p].replace("[C-]", "").trim()
                            split[p] = split[p].replace("[C]", "").trim()
                        }
                        processedForConjunctions = split

                    } else if (stringC[q].indexOf("and") < 2) {
                        beforeAnd = stringC[q - 1].replace("and", "").trim()
                        beforeAnd = beforeAnd.replace("with C-", "").trim()
                        beforeAnd = beforeAnd.replace("with C", "").trim()
                        beforeAnd = beforeAnd.replace("or better", "").trim()
                        beforeAnd = beforeAnd.replace("[C-]", "").trim()
                        beforeAnd = beforeAnd.replace("[C]", "").trim()
                        beforeAnd = disjunctionCheckArray(beforeAnd)

                        afterAnd = stringC[q].replace("and", "").trim()
                        afterAnd = afterAnd.replace("with C-", "").trim()
                        afterAnd = afterAnd.replace("with C", "").trim()
                        afterAnd = afterAnd.replace("or better", "").trim()
                        afterAnd = afterAnd.replace("[C-]", "").trim()
                        afterAnd = afterAnd.replace("[C]", "").trim()
                        afterAnd = disjunctionCheckArray(afterAnd)

                        processedForConjunctions = processedForConjunctions.concat([beforeAnd, afterAnd])
                        arrayToDisjunctionCheck = arrayToDisjunctionCheck.concat([beforeAnd, afterAnd])


                    }
                } else if (stringC[q].includes("ALEKS") == false){
                    console.log(stringC[q])
                    arrayToDisjunctionCheck = arrayToDisjunctionCheck.concat(stringC[q]);
                }

            } else if (Array.isArray(stringC[q])) {
                processedForConjunctions = processedForConjunctions.concat(conjunctionCheckArray(stringC[q]))
                arrayToDisjunctionCheck = arrayToDisjunctionCheck.concat(conjunctionCheckArray(stringC[q]))

            }
            
        }
        console.log("arrayToDisjunctionCheck 2: ", arrayToDisjunctionCheck)

        processedForConjunctions = disjunctionCheckArray(arrayToDisjunctionCheck)
    } else if (typeof stringC == "string") {

        processedForConjunctions = conjunctionCheckString(stringC)
    }

    if (processedForConjunctions == []) {
        processedForDisjunctions == [stringD]
    }
    return processedForConjunctions;
}

function disjunctionCheckString(stringD) {
    processedForDisjunctions = [stringD]

    if (typeof stringD == "string") {

        if (stringD.includes("or")) {

            processedForDisjunctions = []


            console.log("contains or: ", stringD)
            console.log("or idx: ", stringD.indexOf("or"))
            console.log("str len: ", stringD.length)
            console.log("len - idx: ", stringD.length - stringD.indexOf("or"))

            if (stringD.split("or").filter(isEmpty).length > 1) {

                var split = stringD.split("or").filter(isEmpty).filter(isBetter)
                console.log("contains or (split): ", split)
                console.log("contains or (split): ", stringD)
                for (let w = 0; w < split.length; w++) {
                    split[w] = split[w].replace("with C-", "").trim()
                    split[w] = split[w].replace("with C", "").trim()
                    split[w] = split[w].replace("or better", "").trim()
                    split[w] = split[w].replace("[C-]", "").trim()
                    split[w] = split[w].replace("[C]", "").trim()
                }
                processedForDisjunctions = split.filter(isBetter)
            } else {
                processedForDisjunctions = [processedForDisjunctions]
            }

        }
    }
    return [processedForDisjunctions];
}

function disjunctionCheckArray(stringD) {
    processedDisjunctions = []

    if (Array.isArray(stringD)) {


        for (let t = 0; t < stringD.length; t++) {

            if (typeof stringD[t] == "string") {


                if (stringD[t].includes("or")) {

                    stringD[t] = stringD[t].replace("or better", "").trim()
                    stringD[t] = stringD[t].replace("with C-", "").trim()
                    stringD[t] = stringD[t].replace("with C", "").trim()
                    stringD[t] = stringD[t].replace("[C-]", "").trim()
                    stringD[t] = stringD[t].replace("[C]", "").trim()

                    console.log("contains or: ", stringD[t])
                    console.log("or idx: ", stringD[t].indexOf("or"))
                    console.log("str len: ", stringD[t].length)
                    console.log("len - idx: ", stringD[t].length - stringD[t].indexOf("or"))

                    if ((stringD[t].length - stringD[t].indexOf("or")) < 4) {
                        beforeOr = stringD[t].replace("or", "").trim()
                        beforeOr = beforeOr.replace("with C-", "").trim()
                        beforeOr = beforeOr.replace("with C", "").trim()
                        beforeOr = beforeOr.replace("or better", "").trim()
                        beforeOr = beforeOr.replace("[C-]", "").trim()
                        beforeOr = beforeOr.replace("[C]", "").trim()

                        afterOr = stringD[t + 1].replace("or", "").trim()
                        afterOr = afterOr.replace("with C-", "").trim()
                        afterOr = afterOr.replace("with C", "").trim()
                        afterOr = afterOr.replace("or better", "").trim()
                        afterOr = afterOr.replace("[C-]", "").trim()
                        afterOr = afterOr.replace("[C]", "").trim()

                        processedDisjunctions = processedDisjunctions.concat([beforeOr, afterOr])


                    } else if (stringD[t].split("or").filter(isEmpty).length > 1) {
                        var split = stringD[t].split("or").filter(isEmpty).filter(isBetter)
                        console.log("contains or (split): ", split)
                        console.log("contains or (split): ", stringD)

                        for (let v = 0; v < split.length; v++) {
                            split[v] = split[v].replace("with C-", "").trim()
                            split[v] = split[v].replace("with C", "").trim()
                            split[v] = split[v].replace("or better", "").trim()
                            split[v] = split[v].replace("[C-]", "").trim()
                            split[v] = split[v].replace("[C]", "").trim()
                        }
                        processedDisjunctions = processedDisjunctions.concat(split)

                    } else if (stringD[t].indexOf("or") < 2) {
                        beforeOr = stringD[t - 1].replace("or", "").trim()
                        beforeOr = beforeOr.replace("with C-", "").trim()
                        beforeOr = beforeOr.replace("with C", "").trim()
                        beforeOr = beforeOr.replace("or better", "").trim()
                        beforeOr = beforeOr.replace("[C-]", "").trim()
                        beforeOr = beforeOr.replace("[C]", "").trim()

                        afterOr = stringD[t].replace("or", "").trim()
                        afterOr = afterOr.replace("with C-", "").trim()
                        afterOr = afterOr.replace("with C", "").trim()
                        afterOr = afterOr.replace("or better", "").trim()
                        afterOr = afterOr.replace("[C-]", "").trim()
                        afterOr = afterOr.replace("[C]", "").trim()

                        processedDisjunctions = processedDisjunctions.concat([beforeOr, afterOr])
                        
                    }


                } else if (stringD[t].includes("ALEKS") == false){
                    processedDisjunctions = processedDisjunctions.concat(stringD[t]);
                }

            } else if (Array.isArray(stringD[t])) {

                processedDisjunctions = processedDisjunctions.concat([disjunctionCheckArray(stringD[t])])

            }
        }
    } else if (typeof stringD == "string") {

        processedDisjunctions = disjunctionCheckString(stringD)
    }

    if (processedDisjunctions == []) {

        processedDisjunctions == [stringD]
    }
    return processedDisjunctions;
}

document.addEventListener("DOMContentLoaded", function (e) {
    const CS_courses = document.getElementsByClassName("courseblock");
    // console.log("CS_courses: ", CS_courses);
    // console.log("CS_courses.length: ", CS_courses.length);

    courseArray = []

    // for (let i = 0; i < 40; i++) {
    for (let i = 0; i < CS_courses.length; i++) {

        // console.log(CS_courses[i]);
        courseArray.push([])
        var courseNamesString = (CS_courses[i].getElementsByClassName("courseblocktitle"))[0].innerText;
        // console.log("course name: ", courseNamesString);
        var courseNamesArray = courseNamesString.split(",");
        courseNamesArray.pop()
        // console.log("course names array: ", courseNamesArray);
        courseArray[i].push(new Class(courseNamesArray[0], courseNamesArray[1], []))

        var coursePrereqsStringSource = (CS_courses[i].getElementsByClassName("courseblockextra noindent"))[0];
        // console.log("coursePrereqsStringSource: ", coursePrereqsStringSource)
        var coursePrereqsString = ""
        if (typeof coursePrereqsStringSource !== "undefined") {

            coursePrereqsStringSource = coursePrereqsStringSource.childNodes
            // console.log(coursePrereqsStringSource[0].innerText)
            if (coursePrereqsStringSource[0].innerText.includes("Prerequisite:") == false) {
                // console.log( "remove")
            } else {

                // console.log("coursePrereqsStringSource: ", coursePrereqsStringSource)
                for (let k = 0; k < coursePrereqsStringSource.length; k++) {
                    if (coursePrereqsStringSource[k].nodeName == "#text") {
                        // console.log(coursePrereqsStringSource[k].nodeName)
                        // console.log("#text: ",coursePrereqsStringSource[k].data)
                        coursePrereqsString = coursePrereqsString + coursePrereqsStringSource[k].data
                        // console.log("coursePrereqsString: ", coursePrereqsString)
                    }


                    if (coursePrereqsStringSource[k].nodeName == "A") {
                        // console.log("A: ",coursePrereqsStringSource[k].textContent)
                        coursePrereqsString = coursePrereqsString + " " + coursePrereqsStringSource[k].textContent
                        // console.log("coursePrereqsString: ", coursePrereqsString)
                    }

                    // console.log("text to check: ",coursePrereqsStringSource[k+1])
                    // console.log(coursePrereqsStringSource[k].nodeName)
                    coursePrereqsString = coursePrereqsString.replace("\n", ' ').trim().replace(/\s\s+/g, ' ')

                }
                coursePrereqsString = coursePrereqsString.split(/\(([^()]+)\)/g).filter(isEmpty)
                // var CoreqsArray = []
                // var PrereqsArray = []
                // courseArray[i].push(PrereqsArray)
                // courseArray[i].push(CoreqsArray)

                


                for (let l = 0; l < coursePrereqsString.length; l++) {
                    coursePrereqsString[l]= coursePrereqsString[l].replace("or better", "").trim()
                    coursePrereqsString[l]= coursePrereqsString[l].replace("with C-", "").trim()
                    coursePrereqsString[l]= coursePrereqsString[l].replace("with C", "").trim()
                    coursePrereqsString[l]= coursePrereqsString[l].replace("[C-]", "").trim()
                    coursePrereqsString[l]= coursePrereqsString[l].replace("[C]", "").trim()
                }
                coursePrereqsString = coursePrereqsString.filter(isConcurrent)
                coursePrereqsString = coursePrereqsString.filter(isNotMathTest)
                console.log("coursePrereqsString: ", coursePrereqsString)

                var coursePrereqsData = conjunctionCheckArray(coursePrereqsString)
                currClass = courseArray[i][0]
                console.log("currClass: ",currClass)
                currClass.prereqs = coursePrereqsData
                console.log("OUTPUT PREREQS", coursePrereqsData)

                page = document.getElementsByClassName("page-title")[0].innerText
                console.log(page)

                if (page.includes("Computer Science")) {
                    fetch("/CSDATA", {
                        method: "POST",
                        headers: {
                          "Content-type": "application/json"
                        },
                        body: JSON.stringify({courseArray})
                    })
                } else if (page.includes("Math")) {
                    fetch("/MTHDATA", {
                        method: "POST",
                        headers: {
                          "Content-type": "application/json"
                        },
                        body: JSON.stringify({courseArray})
                    })
                }
                



                // for (let l = 0; l < coursePrereqsString.length; l++) {
                //     coursePrereqsString[l]= coursePrereqsString[l].replace("or better", "").trim()
                //     coursePrereqsString[l]= coursePrereqsString[l].replace("with C", "").trim()
                //     coursePrereqsString[l]= coursePrereqsString[l].replace("[C]", "").trim()

                //     // console.log("coursePrereqsString[l]: ", coursePrereqsString[l])

                //     // coursePrereqsString[l]= coursePrereqsString[l].replace("or better", "").trim()
                //     // coursePrereqsString[l]= coursePrereqsString[l].replace("[C]", "").trim()
                //     if ((coursePrereqsString[l] == " and ")||(coursePrereqsString[l] == "and ")||(coursePrereqsString[l] == " and")||(coursePrereqsString[l] == "and")){
                //         // console.log("'and' separator:", coursePrereqsString[l])
                //         req1 = coursePrereqsString[l-1].split('or').filter(isBetter)
                //             for (let m = 0; m < req1.length; m++) {
                //                 req1[m] = req1[m].replace("with C", "").trim()
                //                 req1[m] = req1[m].replace("or better", "").trim()
                //                 req1[m] = req1[m].replace("[C]", "").trim()
                //             }
                //         req2 = coursePrereqsString[l+1].split('or').filter(isBetter)
                //             for (let n = 0; n < req2.length; n++) {
                //                 req2[n] = req2[n].replace("with C", "").trim()
                //                 req2[n] = req2[n].replace("or better", "").trim()
                //                 req2[n] = req2[n].replace("[C]", "").trim()
                //             }
                //         console.log("courseArray[i][1]: ", courseArray[i][1])
                //         // courseArray[i][1] = courseArray[i][1].push(req2)

                //         // console.log("req1:", req1)
                //         // console.log("req2:", req2)
                //         PrereqsArray.push(req1)
                //         PrereqsArray.push(req2)
                //     } else if (coursePrereqsString[l].includes("and")){
                //         console.log("contains and: ", coursePrereqsString[l])
                //         console.log("and idx: ", coursePrereqsString[l].indexOf("and"))
                //         console.log("str len: ", coursePrereqsString[l].length)
                //         console.log("len - idx: ", coursePrereqsString[l].length - coursePrereqsString[l].indexOf("and"))
                //         if ((coursePrereqsString[l].length - coursePrereqsString[l].indexOf("and"))<5){
                //             beforeAnd = coursePrereqsString[l]
                //             afterAnd = coursePrereqsString[l+1]
                //             courseArray[i][1] = courseArray[i][1].push()
                //         } else if (coursePrereqsString[l].split("and").filter(isEmpty).length > 1){
                //             var split = coursePrereqsString[l].split("and").filter(isEmpty)
                //             console.log("contains and (split): ", split)
                //             console.log("contains and (split): ", coursePrereqsString[l])
                //             for (let p = 0; p < split.length; p++) {
                //                 split[p] = split[p].replace("with C", "").trim()
                //                 split[p] = split[p].replace("or better", "").trim()
                //                 split[p] = split[p].replace("[C]", "").trim()
                //             }
                //             courseArray[i][1] = courseArray[i][1].concat(split);
                //             console.log("courseArray[i][1]: ", courseArray[i][1])
                //         } else if (coursePrereqsString[l].indexOf("and")<2){
                //             beforeAnd = coursePrereqsString[l-1]
                //             afterAnd = coursePrereqsString[l]
                //             console.log("beforeAnd: ", beforeAnd)
                //         }
                //     }



                //     // if ((coursePrereqsString[l].includes("may be taken concurrently"))){
                //     //     console.log("concurently: ", coursePrereqsString[l])
                //     //     CoreqsArray.push(coursePrereqsString[l-1].replace("with C", "").replace("or better", "").trim())
                //     // }
                //     // if ((coursePrereqsString[l].includes("ALEKS"))||(coursePrereqsString[l].includes("Math Placement"))){
                //     //     console.log(coursePrereqsString[l])
                //     // }


                // }
                console.log("course: ", courseArray[i])
                // console.log("coursePrereqsString: ", coursePrereqsString)
            }




        }


        // var coursePrereqs = (CS_courses[i].getElementsByClassName("courseblockextra noindent"))[0];
        // courseArray[i].push(coursePrereqs)
        // if(typeof coursePrereqs !== "undefined")
        //     {
        //         coursePrereqs = coursePrereqs.getElementsByTagName("a");
        //         coursePrereqsArray = []
        //         for (let j = 0; j < coursePrereqs.length; j++) {
        //             coursePrereqsArray.push(coursePrereqs[j].innerText)
        //         }
        //         courseArray[i][1]= coursePrereqsArray
        //     } 




    }
    console.log(courseArray)

});
