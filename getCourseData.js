var fs = require('fs');
var bodyParser = require('body-parser');
const { lookupService } = require('dns/promises');

getData()

function getData() {
  // credit for following function, referenced:
  // https://stackoverflow.com/questions/38235715/fetch-reject-promise-and-catch-the-error-if-status-is-not-ok
  fetch("https://catalog.oregonstate.edu/courses/").then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error('Something went wrong');
  })
    .then((responseText) => {
      // getting array of urls
      var regURLel = /<li><a href=".courses.[a-zA-Z]*.">/gm
      var found = [...responseText.matchAll(regURLel)]
      linkStrings = []
      for (var i = 0; i < found.length; i += 1) {
        linkStrings.push(found[i][0])
        linkStrings[i] = "https://catalog.oregonstate.edu" + linkStrings[i].substring(13, (linkStrings[i].length - 2))
      }
      console.log(linkStrings);

      // getting HTML for each page
      var courseArrayAggregate = []
      for (var i = 38; i < 50; i += 1) {
        // for (var i = 0; i < linkStrings.length; i += 1) {
        setTimeout(() => { }, 500);
        console.log(linkStrings[i])
        fetch(linkStrings[i]).then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error('Something went wrong');
        })
          .then((deptResponseText) => {
            var courseArrayDept = []
            // console.log(deptResponseText.replace(/(?:\r\n|\r|\n)/g,""))
            var regClassHTML = /<h2 class="courseblocktitle"><strong>.+?(?=<div class="courseblock">)/gm
            var deptHTML = deptResponseText.replace(/(?:\r\n|\r|\n)/g, "")
            // console.log(deptHTML)
            var classHTMLArray = [...deptHTML.matchAll(regClassHTML)]
            for (var j = 0; j < 2; j += 1) {
              // for (var j = 0; j < classHTMLArray.length; j += 1) {
              // create class object for each course lising of the department page

              // course ID and Name
              regCourseBlockTitle = /<h2 class="courseblocktitle"><strong>.+?(?=<.h2>)/gm
              var courseNameString = classHTMLArray[j][0].match(regCourseBlockTitle)[0]
              courseNameString = courseNameString.substring(37, courseNameString.length - 9)
              var courseNamesArray = courseNameString.split(",");
              courseNamesArray.pop()
              courseArrayDept.push(new Class(courseNamesArray[0], courseNamesArray[1], []))

              // course prereqs
              var regCoursePrereqBlock = /<p class="courseblockextra noindent">.+?(?=<.p>)/gm
              var coursePrereqSourceStrings = classHTMLArray[j][0].match(regCoursePrereqBlock)

              if (coursePrereqSourceStrings !== null) {

                // can be multiple array items for reccomended courses, equivilents, and how many times a course is repeatable
                for (var l = 0; l < coursePrereqSourceStrings.length; l += 1) {

                  // if statement to filter out elements on non-prerequisite topics
                  if (coursePrereqSourceStrings[l].includes("Prerequisite")) {

                    var regPrereqString = />(?!<).+?(?=<)/gm
                    var coursePrereqStringArray = (coursePrereqSourceStrings[l] + "<").match(regPrereqString)
                    var coursePrereqString = ""

                    for (var k = 0; k < coursePrereqStringArray.length; k += 1) {

                      coursePrereqStringArray[k] = coursePrereqStringArray[k].substring(1)
                      coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("or better", "").trim()
                      coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with C-", "").trim()
                      coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with C", "").trim()
                      coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[C-]", "").trim()
                      coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[C]", "").trim()
                      if ((coursePrereqStringArray[k].includes("Prerequisite:") == false) && (coursePrereqStringArray[k] != " ")) {
                        coursePrereqString = coursePrereqString + coursePrereqStringArray[k]
                      }
                    }
                    // console.log()
                    // console.log("coursePrereqString:", coursePrereqString)
                    courseArrayDept[j].prereqs = processPrereqString(coursePrereqString)
                  }
                }

                // coursePrereqStringArray[k]= coursePrereqStringArray[k][0]
              }
              // console.log(coursePrereqString)

              // console.log(coursePrereqStringArray)
              // console.log()
              // courseArrayDept.push()

            }
            // console.log(courseArrayDept)
            console.log("courseArrayDept:", courseArrayDept)
            courseArrayAggregate = courseArrayAggregate.concat(courseArrayDept)
            console.log("courseArrayAggregate1:", courseArrayAggregate)

          })
          .catch((error) => {
            console.log(error)
          });

      }
      console.log("courseArrayAggregate2:", courseArrayAggregate)

    })
    .catch((error) => {
      console.log(error)
    });
}
/////////////////////////////////////////////////////////////////////////////
// helper functions below
////////////////////////////////////////////////////////////////////////////

function Class(courseID, courseName, prereqs) {
  this.courseID = courseID;
  this.courseName = courseName;
  this.prereqs = prereqs;
}

function Conjuction(array) {
  this.array = array
}

function Disjunction(array) {
  this.array = array
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

function processPrereqString(inputString) {
  var prereqArray = []
  var trySplitByParen = inputString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    prereqArray = unnest(inputString)
  }

  else {
    prereqArray = [conjunctionCheck(inputString)]
    // console.log("+++++++++++++++++++++++")
  }

  // console.log("prereqArray1: ", prereqArray)
  return prereqArray
}

function unnest(nestedString) {
  prereqArrayUnnest = []
  // console.log("nestedString: ", nestedString)
  var trySplitByParen = nestedString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    tempArray = trySplitByParen.filter(isEmpty)
    // console.log("*********************")
    // console.log("inParenthesisArray Before: ", nestedString.match(/\(([^()]+)\)/g))
    inParenthesisArray = nestedString.match(/\(([^()]+)\)/g)
    for (let i = 0; i < inParenthesisArray.length; i++) {
      // console.log(typeof inParenthesisArray[i])
      trim = inParenthesisArray[i]
      trim = trim.substring(1, (trim.length - 1))
      processedElement = conjunctionCheck(trim)
      for (let k = 0; k < tempArray.length; k++) {
        if (tempArray[k] == trim) {
          tempArray[k] = processedElement
        }
      }
    }

    // process array for nested parenthesis
    for (let j = 0; j < tempArray.length; j++) {
      console.log()
      // console.log("j: ", j)

      if (typeof tempArray[j] == "string") {
        lookForOpeningPar = tempArray[j].match(/[(]/)
        lookForClosingPar = tempArray[j].match(/[)]/)

        // console.log("close:", lookForClosingPar)
        // console.log("open:", lookForOpeningPar)

        if ((lookForOpeningPar == null) && (lookForClosingPar != null)) {
          console.log("only close in string seg")
          included = []
          conjunction = false
          disjunction = false
          nextIdx = -1

          // assembling conjunction or disjunction leading up to first ")"
          if (lookForClosingPar.index > 0) {
            currEl = tempArray[j].substring(0, lookForClosingPar.index)
            if (currEl.match("and") != null) {
              conjunction = true
              currEl = currEl.replaceAll("and", "").trim()
            }
            else if (currEl.match("or") != null) {
              disjunction = true
              currEl = currEl.replaceAll("or", "").trim()
            }
            included.unshift(currEl)
            // console.log("included: ", included)
          }

          // creating element for any remaining substring after first "("
          if (lookForClosingPar.index < (tempArray[j].length - 1)) {
            tempArray[j] = tempArray[j].substring(lookForClosingPar.index + 1)
          }
          else {
            tempArray.splice(j, 1)
          }

          for (let p = j - 1; p > -1; p--) {

            currEl = tempArray[p]

            if (typeof currEl == "string") {

              if (currEl.match("and") != null) {
                conjunction = true
                currEl = currEl.replaceAll("and", "").trim()
              }
              else if (currEl.match("or") != null) {
                disjunction = true
                currEl = currEl.replaceAll("or", "").trim()
              }

              // stop when "(" is found
              if (currEl.match(/[(]/) != null) {
                nextIdx = p

                // add to temporary, remove from source
                currEl = currEl.substring(currEl.match(/[(]/).index + 1)
                if (currEl != "") {
                  included.unshift(currEl)
                  deleted = tempArray.splice(p, 1)
                }
                p = -1
                break
              }
              else {
                included.unshift(currEl)
                deleted = tempArray.splice(p, 1)
              }

            }
            else {
              included.unshift(currEl)
              deleted = tempArray.splice(p, 1)
            }
          }
          if (tempArray.length > 0) {
            replacedOpening = tempArray[nextIdx].substring(lookForClosingPar.index + 1)
            if (replacedOpening != "") {
              tempArray[nextIdx] = tempArray[nextIdx].substring(lookForClosingPar.index + 1)
            }
            else {
              tempArray.splice(nextIdx, 1)
            }

            if (conjunction == true) {
              newCon = new Conjuction(included)
              tempArray.splice(nextIdx, 0, newCon)
            }
            else if (disjunction == true) {
              newDis = new Disjunction(included)
              tempArray.splice(nextIdx, 0, newDis)
            }

            j = nextIdx
          }
          else {
            if (conjunction == true) {
              newCon = new Conjuction(included)
              tempArray.push(newCon)
            }
            else if (disjunction == true) {
              newDis = new Disjunction(included)
              tempArray.push(newDis)
            }
            j = 1
          }
          console.log("tempArray3: ", tempArray)
        }
        else if ((lookForOpeningPar != null) && (lookForClosingPar != null)) {
          if (lookForClosingPar.index < lookForOpeningPar.index) {
            console.log("close then open in string seg")
            included = []
            conjunction = false
            disjunction = false
            nextIdx = -1
            // assembling conjunction or disjunction leading up to first ")"
            for (let q = j - 1; q > -1; q--) {

              currEl = tempArray[q]

              if (typeof currEl == "string") {

                if (currEl.match("and") != null) {
                  conjunction = true
                  currEl = currEl.replaceAll("and", "").trim()
                }
                else if (currEl.match("or") != null) {
                  disjunction = true
                  currEl = currEl.replaceAll("or", "").trim()
                }

                // stop when "(" is found
                if (currEl.match(/[(]/) != null) {
                  nextIdx = q

                  // add to temporary, remove from source
                  currEl = currEl.substring(currEl.match(/[(]/).index + 1)
                  if (currEl != "") {
                    included.unshift(currEl)
                    deleted = tempArray.splice(q, 1)
                  }
                  p = -1
                  break
                }
                else {
                  included.unshift(currEl)
                  deleted = tempArray.splice(q, 1)
                }

              }
              else {
                included.unshift(currEl)
                deleted = tempArray.splice(q, 1)
              }
            }

            if (tempArray.length > 0) {
              replacedOpening = tempArray[nextIdx].substring(lookForClosingPar.index + 1)
              if (replacedOpening != "") {
                tempArray[nextIdx] = tempArray[nextIdx].substring(lookForClosingPar.index + 1)
              }
              else {
                tempArray.splice(nextIdx, 1)
              }

              if (conjunction == true) {
                newCon = new Conjuction(included)
                tempArray.splice(nextIdx, 0, newCon)
              }
              else if (disjunction == true) {
                newDis = new Disjunction(included)
                tempArray.splice(nextIdx, 0, newDis)
              }

              j = nextIdx
            }
            else {
              if (conjunction == true) {
                newCon = new Conjuction(included)
                tempArray.push(newCon)
              }
              else if (disjunction == true) {
                newDis = new Disjunction(included)
                tempArray.push(newDis)
              }
              j = 1
            }
            console.log("tempArray4: ", tempArray)
          }
          else if (lookForClosingPar.index > lookForOpeningPar.index) {
            console.log("open then close in string seg")
            console.log("UNANTICIPATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
          }
        }
        else if ((lookForOpeningPar != null) && (lookForClosingPar == null)) {
          console.log("only open in string seg")
          leftstartidx = lookForOpeningPar.index

          spliceIdx = j + 1
          if (lookForOpeningPar.index > 0) {
            beforeOpen = tempArray[j].substring(0, lookForOpeningPar.index - 1)
            tempArray.splice(spliceIdx, 0, beforeOpen)
            spliceIdx++
          }

          // check for addtional opening pars
          remaining = tempArray[j].substring(lookForOpeningPar.index + 1)
          lookForOpeningPar = remaining.match(/[(]/)
          while (lookForOpeningPar != null) {
            leftstartidx = lookForOpeningPar.index
            tempArray.splice(spliceIdx, 0, "(" + tempArray[j].substring(leftstartidx, lookForOpeningPar.index - 1))
            spliceIdx++
            remaining = remaining.substring(lookForOpeningPar.index + 1)
            lookForOpeningPar = remaining.match(/[(]/)
          }

          tempArray.splice(spliceIdx, 0, "(" + remaining.substring(leftstartidx))
          tempArray.splice(j, 1)
          j = spliceIdx

          console.log("tempArray5: ", tempArray)
          console.log()

        }
      }
    }

    // process array for "and" elements outside of parenthesis
    containsAnd = false
    containsOr = false
    for (let j = 0; j < tempArray.length; j++) {
      if (typeof tempArray[j] == "string") {
        if ((tempArray[j].indexOf("and")) > -1) {
          containsAnd = true
          if (tempArray[j].trim() == "and") {
            // console.log("just and: ", tempArray[j])
            tempArray.splice(j, 1)
          }
          else if ((tempArray[j].length - tempArray[j].indexOf("and") < 5)) {
            // console.log("and at end of string: ", tempArray[j])
            split = tempArray[j].split("and")
            tempArray[j] = split[0]
          }
          else if (tempArray[j].indexOf("and") < 5) {
            // console.log("and at begining of string: ", tempArray[j])
            split = tempArray[j].split("and")
            tempArray[j] = split[1]
          }
          tempArray.filter(isEmpty)
        }
      }
    }

    // process array for "or" elements outside of parenthesis
    for (let j = 0; j < tempArray.length; j++) {
      if (typeof tempArray[j] == "string") {
        if ((tempArray[j].indexOf("or")) > -1) {
          containsOr = true
          if (tempArray[j].trim() == "or") {
            // console.log("just or: ", tempArray[j])
            tempArray.splice(j, 1)
          }
          else if ((tempArray[j].length - tempArray[j].indexOf("or") < 4)) {
            // console.log("and at end of string: ", tempArray[j])
            split = tempArray[j].split("or")
            tempArray[j] = split[0]
          }
          else if (tempArray[j].indexOf("or") < 4) {
            // console.log("and at begining of string: ", tempArray[j])
            split = tempArray[j].split("or")
            tempArray[j] = split[1]
          }
          tempArray.filter(isEmpty)
        }
      }
    }


    if (containsAnd && containsOr) {
      console.log("ERROR, parenthesis unexpectedly contain both : 'and', 'or'.")
      console.log("tempArray6: ", tempArray)
    }
    else if (containsAnd) {
      prereqArrayUnnest = [new Conjuction(tempArray)]

    }
    else if (containsOr) {
      prereqArrayUnnest = [new Disjunction(tempArray)]
    }
    else {
      prereqArrayUnnest = tempArray
    }

  }
  return prereqArrayUnnest
}

function conjunctionCheck(stringC) {

  processedForConjunctions = stringC

  if (stringC.includes("and")) {

    if (stringC.split("and").filter(isEmpty).length > 1) {

      var split = stringC.split("and").filter(isEmpty).filter(isBetter)
      for (let u = 0; u < split.length; u++) {
        split[u] = split[u].replaceAll("with C-", "").trim()
        split[u] = split[u].replaceAll("with C", "").trim()
        split[u] = split[u].replaceAll("or better", "").trim()
        split[u] = split[u].replaceAll("[C-]", "").trim()
        split[u] = split[u].replaceAll("[C]", "").trim()
        split[u] = disjunctionCheck(split[u])
      }
      processedForConjunctions = new Conjuction(split)

    } else {
      console.log("found 'and' error")
    }
  } else {
    processedForConjunctions = disjunctionCheck(stringC)
  }

  return processedForConjunctions;
}

function disjunctionCheck(stringD) {
  processedForDisjunctions = stringD

  if (stringD.includes("or")) {

    processedForDisjunctions = []

    // console.log("contains or: ", stringD)
    // console.log("or idx: ", stringD.indexOf("or"))
    // console.log("str len: ", stringD.length)
    // console.log("len - idx: ", stringD.length - stringD.indexOf("or"))

    if (stringD.split("or").filter(isEmpty).length > 1) {

      var split = stringD.split("or").filter(isEmpty).filter(isBetter)
      for (let w = 0; w < split.length; w++) {
        split[w] = split[w].replaceAll("with C-", "").trim()
        split[w] = split[w].replaceAll("with C", "").trim()
        split[w] = split[w].replaceAll("or better", "").trim()
        split[w] = split[w].replaceAll("[C-]", "").trim()
        split[w] = split[w].replaceAll("[C]", "").trim()
        split[w] = conjunctionCheck(split[w])
      }
      processedForDisjunctions = new Disjunction(split)
    } else {
      console.log("WTF WTF WTF WTF")
      console.log('stringD.split("or"): ', stringD.split("or"))
    }

  }

  return processedForDisjunctions;
}