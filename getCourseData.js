var fs = require('fs');
var bodyParser = require('body-parser');
const { lookupService } = require('dns/promises');

getData()

function getData() {
  // credit for following function, referenced:
  // https://stackoverflow.com/questions/38235715/fetch-reject-promise-and-catch-the-error-if-status-is-not-ok
  var catalogPromise = fetch("https://catalog.oregonstate.edu/courses/").then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error('Something went wrong');
  })
  catalogPromise.then((responseText) => {
    // getting array of urls
    var regURLel = /<li><a href=".courses.[a-zA-Z]*.">/gm
    var found = [...responseText.matchAll(regURLel)]
    linkStrings = []
    for (var i = 0; i < found.length; i += 1) {
      linkStrings.push(found[i][0])
      linkStrings[i] = "https://catalog.oregonstate.edu" + linkStrings[i].substring(13, (linkStrings[i].length - 2))
    }
    // console.log(linkStrings);

    // getting HTML for each page
    var courseArrayAggregate = []
    for (var i = 38; i < 39; i += 1) {
      // for (var i = 0; i < linkStrings.length; i += 1) {
      setTimeout(() => { }, 500);
      // console.log(linkStrings[i])

      var deptPromise = fetch(linkStrings[i]).then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Something went wrong');
      })
      deptPromise.then((deptResponseText) => {
        var courseArrayDept = []
        // console.log(deptResponseText.replace(/(?:\r\n|\r|\n)/g,""))
        var regClassHTML = /<h2 class="courseblocktitle"><strong>.+?(?=<div class="courseblock">)/gm
        var deptHTML = deptResponseText.replace(/(?:\r\n|\r|\n)/g, "")
        // console.log(deptHTML)
        var classHTMLArray = [...deptHTML.matchAll(regClassHTML)]


        for (var classArrayIdx = 0; classArrayIdx < 2; classArrayIdx += 1) {
          // for (var classArrayIdx = 0; classArrayIdx < classHTMLArray.length; classArrayIdx += 1) {
          // create class object for each course lising of the department page

          // course ID and Name
          regCourseBlockTitle = /<h2 class="courseblocktitle"><strong>.+?(?=<.h2>)/gm
          // console.log(classHTMLArray[classArrayIdx][0].match(regCourseBlockTitle)[0])
          var courseHTML = classHTMLArray[classArrayIdx]
          if (courseHTML != undefined) {
            var courseNameString = classHTMLArray[classArrayIdx][0].match(regCourseBlockTitle)[0]
            courseNameString = courseNameString.substring(37, courseNameString.length - 9)
            var courseNamesArray = courseNameString.split(",");
            courseNamesArray.pop()
            courseArrayDept.push(new Class(courseNamesArray[0], courseNamesArray[1], []))

            // course prereqs
            var regCoursePrereqBlock = /<p class="courseblockextra noindent">.+?(?=<.p>)/gm
            var coursePrereqSourceStrings = classHTMLArray[classArrayIdx][0].match(regCoursePrereqBlock)


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
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with D-", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with D", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[D-]", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[D]", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with B-", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("with B", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[B-]", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replaceAll("[B]", "").trim()
                    if ((coursePrereqStringArray[k].includes("Prerequisite:") == false) && (coursePrereqStringArray[k] != " ")) {
                      coursePrereqString = coursePrereqString + coursePrereqStringArray[k]
                    }
                  }
                  coursePrereqStringArray = coursePrereqStringArray.filter(isConcurrent)
                  coursePrereqStringArray = coursePrereqStringArray.filter(isNotMathTest)
                  coursePrereqStringArray = coursePrereqStringArray.filter(isNotInto)
                  coursePrereqStringArray = coursePrereqStringArray.filter(isEmpty)
                  // console.log()
                  // console.log("coursePrereqString:", coursePrereqString)
                  // courseArrayDept[classArrayIdx].prereqs = processPrereqString(coursePrereqString, courseNamesArray[0])
                  courseArrayDept[classArrayIdx].prereqs = processPrereqString("(CH 121(may be taken concurrently)   orCH 201(may be taken concurrently)  ) or ((CH 231(may be taken concurrently)   orCH 231H(may be taken concurrently)  ) and (CH 261(may be taken concurrently)  orCH 261H(may be taken concurrently)  orCH 271(may be taken concurrently) ))")


                }
              }
            }
          }
        }

        // console.log("courseArrayDept:", courseArrayDept)
        courseArrayAggregate = courseArrayAggregate.concat(courseArrayDept)
        // console.log("Writing department course data to file. ")
        fs.writeFileSync("./classDataAll.json", JSON.stringify(courseArrayAggregate));

      })
        .catch((error) => {
          console.log(error)
        });

      // deptPromise.then((data) => {
      //   console.log("DATA DATA DATA", data);
      //   // console.log("courseArrayAggregate3:", data.courseArrayAggregate);
      // });

    }
    // deptPromise.then((data) => {
    //   console.log("DATA DATA DATA", data);
    //   // console.log("courseArrayAggregate3:", data.courseArrayAggregate);
    // });
    // console.log("courseArrayAggregate2:", courseArrayAggregate)

  })
    .catch((error) => {
      console.log(error)
    });

  catalogPromise.then((data) => {
    console.log("catalog data fetch complete");
    // console.log("DATA DATA DATA", data);
    // console.log("courseArrayAggregate3:", data.courseArrayAggregate);
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

function Conjunction(arrayCon) {
  this.arrayCon = arrayCon
}

function Disjunction(arrayDis) {
  this.arrayDis = arrayDis
}

function mockMatch(string, idxno) {
  this.string = string
  this.idxno = idxno
}

function isEmpty(value) {
  if (typeof value == "string") {

    return (value !== "");
  }
  else {
    return true
  }
}

function isBetter(value) {
  if (typeof value == "string") {
    return (value.trim() !== "better");
  }
  else {
    return true
  }
}

function isConcurrent(value) {
  if (typeof value == "string") {

    return (value.trim() !== "may be taken concurrently");
  }
  else {
    return true
  }
}

function isNotMathTest(value) {
  if (typeof value == "string") {

    return (value.includes("ALEKS") == false);
  }
  else {
    return true
  }
}

function isNotInto(value) {
  if (typeof value == "string") {

    return (value.includes("INTO Combined RW Level") == false);
  }
  else {
    return true
  }
}

function processPrereqString(inputString, coursename) {
  var prereqArray = []
  var trySplitByParen = inputString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    prereqArray = unnest(inputString, coursename)
  }

  else {
    prereqArray = [conjunctionCheck(inputString)]
    // console.log("+++++++++++++++++++++++")
  }

  // console.log("prereqArray1: ", prereqArray)
  return prereqArray
}

function unnest(nestedString, name) {
  originalstring = nestedString
  originalname = name
  prereqArrayUnnest = []
  // console.log("nestedString: ", nestedString)
  var trySplitByParen = nestedString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    tempArray = trySplitByParen.filter(isEmpty)
    console.log("*********************")
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
      for (let z = 0; z < tempArray.length; z++) {
        if (typeof tempArray[z] == "string") {
          tempArray[z] = tempArray[z].replaceAll("or better", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with C-", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with C", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[C-]", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[C]", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with D-", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with D", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[D-]", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[D]", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with B-", "").trim()
          tempArray[z] = tempArray[z].replaceAll("with B", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[B-]", "").trim()
          tempArray[z] = tempArray[z].replaceAll("[B]", "").trim()
        }
      }
      tempArray = tempArray.filter(isConcurrent)
      tempArray = tempArray.filter(isNotMathTest)
      tempArray = tempArray.filter(isNotInto)
      tempArray = tempArray.filter(isEmpty)

    }
    // console.log("tempArray before :", tempArray)

    // process array for nested parenthesis
    // console.log("temparray start:", tempArray)

    tempArray = recursivePass(tempArray, originalstring)
    if (tempArray.length > 1) {
      tempArray = recursivePass(tempArray, originalstring)
    }
    tempArray = processAsStack(tempArray, originalstring)


    console.log("after pass:", tempArray)

  }
  return tempArray
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
        split[u] = split[u].replaceAll("with D-", "").trim()
        split[u] = split[u].replaceAll("with D", "").trim()
        split[u] = split[u].replaceAll("[D-]", "").trim()
        split[u] = split[u].replaceAll("[D]", "").trim()
        split[u] = split[u].replaceAll("with B-", "").trim()
        split[u] = split[u].replaceAll("with B", "").trim()
        split[u] = split[u].replaceAll("[B-]", "").trim()
        split[u] = split[u].replaceAll("[B]", "").trim()
        split[u] = disjunctionCheck(split[u])
      }
      split = split.filter(isEmpty)
      split = split.filter(isNotMathTest)
      split = split.filter(isNotInto)
      split = split.filter(isConcurrent)
      processedForConjunctions = new Conjunction(split)

    } else {
      stringC = stringC.trim()
      // console.log('stringC.indexOf("and"): ', stringC.indexOf("and"))
      if (stringC.trim() == "and") {
        return stringC
      }
      else if (stringC.indexOf("and") == 0) {
        return [stringC.substring(0, 3), stringC.substring(3)]
      }
      else if (stringC.indexOf("and") > 0) {
        return [stringC.substring(0, (stringC.indexOf("and") - 1)), stringC.substring((stringC.indexOf("and")))]
      }
      else {
        console.log("!!!!!!!!!!!!!!!!!!!!!")
        console.log("how to split?")
        console.log('stringC: ', stringC)
        console.log("!!!!!!!!!!!!!!!!!!!!!")
      }
    }
  } else {
    processedForConjunctions = disjunctionCheck(stringC)
  }

  return processedForConjunctions;
}

function disjunctionCheck(stringD) {
  processedForDisjunctions = stringD

  if (stringD.includes("or")) {

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
        split[w] = split[w].replaceAll("with D-", "").trim()
        split[w] = split[w].replaceAll("with D", "").trim()
        split[w] = split[w].replaceAll("[D-]", "").trim()
        split[w] = split[w].replaceAll("[D]", "").trim()
        split[w] = split[w].replaceAll("with B-", "").trim()
        split[w] = split[w].replaceAll("with B", "").trim()
        split[w] = split[w].replaceAll("[B-]", "").trim()
        split[w] = split[w].replaceAll("[B]", "").trim()
        split[w] = conjunctionCheck(split[w])
      }
      processedForDisjunctions = new Disjunction(split)
    } else {
      stringD = stringD.trim()
      // console.log('stringD.indexOf("or"): ', stringD.indexOf("or"))
      if (stringD.trim() == "or") {
        return stringD
      }
      else if (stringD.indexOf("or") == 0) {
        return [stringD.substring(0, 2), stringD.substring(3)]
      }
      else if (stringD.indexOf("or") > 0) {
        return [stringD.substring(0, (stringD.indexOf("or") - 1)), stringD.substring((stringD.indexOf("or")))]
      }
      else {

        console.log("!!!!!!!!!!!!!!!!!!!!!")
        console.log("how to split?")
        console.log('stringD: ', stringD)
        console.log("!!!!!!!!!!!!!!!!!!!!!")
      }

    }

  }

  return processedForDisjunctions;
}



function processAsStack(sourceArray, originalstring) {
  sourceStack = sourceArray.flat()
  console.log(sourceStack)

  for (let stackIdx = 1; stackIdx < (sourceStack.length - 1); stackIdx++) {
    if (sourceStack[stackIdx] == "and") {
      newEl = new Conjunction(sourceStack[stackIdx - 1], sourceStack[stackIdx + 1])
      sourceStack.splice(stackIdx - 1, 3, newEl)
      stackIdx--
    }
    else if (sourceStack[stackIdx] == "or") {
      newEl = new Disjunction(sourceStack[stackIdx - 1], sourceStack[stackIdx + 1])
      sourceStack.splice(stackIdx - 1, 3, newEl)
      stackIdx--
    }
    else if (stackIdx >= (sourceStack.length - 1)) {
      break
    }
  }
  return sourceStack
}

function recursivePass(mixedArray, originalstring) {
  for (let j = 0; j < mixedArray.length; j++) {
    mixedArray = mixedArray.filter(isEmpty)
    console.log()
    console.log("j: ", j)
    console.log("mixedArray:", mixedArray)


    if (typeof mixedArray[j] == "string") {

      lookForOpeningPar = (mixedArray[j] + " ").match(/[(]/)
      lookForClosingPar = (mixedArray[j] + " ").match(/[)]/)

      if (mixedArray[j].trim() == ")") {
        lookForClosingPar = new mockMatch(")", 0)
      }
      if (mixedArray[j].trim() == "(") {
        lookForOpeningPar = new mockMatch("(", 0)
      }


      console.log("mixedArray[j]:", mixedArray[j])
      console.log("close:", lookForClosingPar)
      console.log("open:", lookForOpeningPar)

      if ((lookForOpeningPar == null) && (lookForClosingPar != null)) {
        console.log("only close in string seg")
        included = []
        conjunction = false
        disjunction = false
        nextIdx = -1

        originalLen = mixedArray[j].length
        // assembling conjunction or disjunction leading up to first ")"
        if (lookForClosingPar.index > 0) {
          currEl = mixedArray[j].substring(0, lookForClosingPar.index)
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
        else {
          mixedArray[j] = mixedArray[j].substring(1)
        }

        // checking for any remaining substring after first ")"
        if (mixedArray[j].substring(lookForClosingPar.index + 1).match(/[(]/) != null) {
          spliceIdx = j + 1

          if (lookForClosingPar.index > 0) {
            beforeClose = mixedArray[j].substring(0, lookForClosingPar.index - 1)
            mixedArray.splice(spliceIdx, 0, beforeClose)
            spliceIdx++
          }

          remaining = mixedArray[j].substring(lookForClosingPar.index + 1)
          lookForClosingPar = remaining.match(/[(]/)
          while (lookForClosingPar != null) {
            leftstartidx = lookForClosingPar.index
            console.log("additional", ")" + mixedArray[j].substring(leftstartidx, lookForClosingPar.index - 1))
            mixedArray.splice(spliceIdx, 0, ")" + mixedArray[j].substring(leftstartidx, lookForClosingPar.index - 1))
            spliceIdx++
            remaining = remaining.substring(lookForClosingPar.index + 1)
            lookForClosingPar = remaining.match(/[(]/)
          }

          console.log("final", "(" + remaining.substring(leftstartidx))

          mixedArray.splice(spliceIdx, 0, "(" + remaining.substring(leftstartidx))
          mixedArray.splice(j, 1)
          j = spliceIdx
        }
        else {
          spliceIdx = j
          idxBeforeSplice = j
          beforeClose = mixedArray[j].substring(0, lookForClosingPar.index - 1)
          afterClose = mixedArray[j].substring(lookForClosingPar.index)

          if (lookForClosingPar.index > 0){
            mixedArray.splice(spliceIdx, 1, beforeClose)
            spliceIdx++
            console.log("beforeClose", beforeClose)
            console.log("after close insert: ", mixedArray)
          }

          mixedArray.splice(spliceIdx, 0, afterClose)
          spliceIdx++
          console.log("afterClose", afterClose)
          console.log("mixedArray5: ", mixedArray)
          j = spliceIdx
        }

        for (let p = j - 1; p > -1; p--) {

          currEl = mixedArray[p]

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
                deleted = mixedArray.splice(p, 1)
              }
              p = -1
              break
            }
            else {
              included.unshift(currEl)
              deleted = mixedArray.splice(p, 1)
            }

          }
          else {
            included.unshift(currEl)
            deleted = mixedArray.splice(p, 1)
          }
        }
        if (mixedArray.length >= nextIdx) {
          // console.log("nextIdx", nextIdx)
          // console.log("mixedArray.length", mixedArray.length)
          // console.log("mixedArray", mixedArray)
          // console.log("originalstring:", originalstring)
          // console.log("originalname:", originalname)

          replacedOpening = mixedArray[nextIdx]
          if (typeof replacedOpening == "string") {
            replacedOpening = replacedOpening.substring(lookForClosingPar.index + 1)
            if (replacedOpening != "") {
              mixedArray[nextIdx] = mixedArray[nextIdx].substring(lookForClosingPar.index + 1)
            }
            else {
              mixedArray.splice(nextIdx, 1)
            }
          }
          if (conjunction == true) {
            newCon = new Conjunction(included.filter(isEmpty))
            mixedArray.splice(nextIdx, 0, newCon)
          }
          else if (disjunction == true) {
            newDis = new Disjunction(included.filter(isEmpty))
            mixedArray.splice(nextIdx, 0, newDis)
            console.log("spot a ")
          }

          j = nextIdx
        }
        else {
          if (conjunction == true) {
            newCon = new Conjunction(included.filter(isEmpty))
            mixedArray.push(newCon)
          }
          else if (disjunction == true) {
            newDis = new Disjunction(included.filter(isEmpty))
            mixedArray.push(newDis)
            console.log("spot a ")

          }
          j = 1
        }
        // console.log("mixedArray3: ", mixedArray)
      }
      else if ((lookForOpeningPar != null) && (lookForClosingPar != null)) {
        if (lookForClosingPar.index < lookForOpeningPar.index) {
          console.log("close then open in string seg")
          included = []
          conjunction = false
          disjunction = false
          nextIdx = -1


          mixedArray[j] = mixedArray[j].substring(lookForClosingPar.index + 1)
          console.log("after replace:", mixedArray)
          // assembling conjunction or disjunction leading up to first "("
          for (let q = j - 1; q > -1; q--) {
            // console.log(q)
            // console.log(j)
            // console.log(q<j)
            currEl = mixedArray[q]

            if (typeof currEl == "string") {

              // console.log("currEl", currEl)
              // console.log('currEl.trim() == "("', currEl.trim() == "(")
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
                // console.log("test1")
                nextIdx = q

                // add to temporary, remove from source
                currEl = currEl.substring(currEl.match(/[(]/).index + 1)
                if (currEl != "") {
                  included.unshift(currEl)
                  deleted = mixedArray.splice(q, 1)
                }
                else if (currEl.trim() == "(") {
                  deleted = mixedArray.splice(q, 1)
                }
                q = -1
                break
              }
              else if (currEl.indexOf("(") > -1) {
                nextIdx = q

                if (currEl.trim == "(") {
                  deleted = mixedArray.splice(q, 1)
                }
                else {
                  mixedArray[q] = mixedArray[q].substring(0, (currEl.indexOf("(") - 1))
                }

                q = -1
                break
              }
              else {
                included.unshift(currEl)
                deleted = mixedArray.splice(q, 1)
              }

            }
            else {
              included.unshift(currEl)
              deleted = mixedArray.splice(q, 1)
            }
          }

          if ((mixedArray.length > 0) && (nextIdx > -1)) {
            // console.log("included", included)

            // console.log("nextIdx",nextIdx)
            // console.log("mixedArray.length", mixedArray.length)
            // console.log("mixedArray", mixedArray)
            // console.log("originalstring:", originalstring)
            // console.log("originalname:", originalname)

            // replacedOpening = mixedArray[nextIdx]

            // if (typeof replacedOpening == "string") {
            //   openingClosingQuerry = replacedOpening.match(/[)]/)
            //   // console.log("openingClosingQuerry", openingClosingQuerry)
            //   replacedOpening = replacedOpening.substring(lookForClosingPar.index + 1)

            //   if (openingClosingQuerry == null) {
            //     mixedArray[nextIdx] = ""
            //   }
            //   if (replacedOpening != "") {
            //     mixedArray[nextIdx] = mixedArray[nextIdx].substring(lookForClosingPar.index + 1)
            //   }
            //   else {
            //     mixedArray.splice(nextIdx, 1)
            //   }
            // }

            for (var incIdx; incIdx < included.length; incIdx++) {
              if (typeof mixedArray[incIdx] == "string") {
                mixedArray[incIdx] = conjunctionCheck(mixedArray[incIdx])
              }
            }

            if (conjunction == true) {
              newCon = new Conjunction(included.filter(isEmpty))
              mixedArray.splice(nextIdx, 0, newCon)
              // console.log("mixedArray after con insert ", mixedArray)
            }
            else if (disjunction == true) {
              newDis = new Disjunction(included.filter(isEmpty))
              mixedArray.splice(nextIdx, 0, newDis)
              // console.log("mixedArray after dis insert ", mixedArray)

            }

            j = nextIdx
          }
          else {
            if (conjunction == true) {
              // console.log("included", included)
              newCon = new Conjunction(included.filter(isEmpty))
              console.log(mixedArray.length)
              console.log(nextIdx)
              console.log(originalstring)
              mixedArray.upshift(newCon)
            }
            else if (disjunction == true) {
              console.log(mixedArray.length)
              console.log(nextIdx)
              console.log(originalstring)
              console.log("mixedArray", mixedArray)
              console.log("included", included)

              newDis = new Disjunction(included.filter(isEmpty))
              // console.log(newDis.arrayDis)

              mixedArray.upshift(newDis)
            }
            j = 1
          }
          // console.log("mixedArray4: ", mixedArray)
        }
        else if (lookForClosingPar.index > lookForOpeningPar.index) {
          console.log("open then close in string seg")
          console.log("UNANTICIPATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        }
      }
      else if ((lookForOpeningPar != null) && (lookForClosingPar == null)) {
        console.log("only open in string seg")
        leftstartidx = lookForOpeningPar.index
        console.log("mixedArray before: ", mixedArray)


        if (lookForOpeningPar.index > 0) {

          // check for addtional opening pars
          if (mixedArray[j].substring(lookForOpeningPar.index + 1).match(/[(]/) != null) {
            spliceIdx = j + 1

            beforeOpen = mixedArray[j].substring(0, lookForOpeningPar.index - 1)
            mixedArray.splice(spliceIdx, 0, beforeOpen)
            spliceIdx++

            remaining = mixedArray[j].substring(lookForOpeningPar.index + 1)
            lookForOpeningPar = remaining.match(/[(]/)
            while (lookForOpeningPar != null) {
              leftstartidx = lookForOpeningPar.index
              console.log("additional", "(" + mixedArray[j].substring(leftstartidx, lookForOpeningPar.index - 1))
              mixedArray.splice(spliceIdx, 0, "(" + mixedArray[j].substring(leftstartidx, lookForOpeningPar.index - 1))
              spliceIdx++
              remaining = remaining.substring(lookForOpeningPar.index + 1)
              lookForOpeningPar = remaining.match(/[(]/)
            }

            console.log("final", "(" + remaining.substring(leftstartidx))

            mixedArray.splice(spliceIdx, 0, "(" + remaining.substring(leftstartidx))
            mixedArray.splice(j, 1)
            j = spliceIdx
          }
          else {
            spliceIdx = j
            beforeOpen = mixedArray[j].substring(0, lookForOpeningPar.index - 1)
            afterOpen = mixedArray[j].substring(lookForOpeningPar.index)

            mixedArray.splice(spliceIdx, 1, beforeOpen)
            spliceIdx++
            console.log("beforeOpen", beforeOpen)
            console.log("after open insert: ", mixedArray)

            mixedArray.splice(spliceIdx, 0, afterOpen)
            spliceIdx++
            console.log("afterOpen", afterOpen)
            console.log("mixedArray5: ", mixedArray)
            j = spliceIdx
          }

        }
        // console.log("mixedArray5: ", mixedArray)
        // console.log()

      }
      else if ((lookForOpeningPar == null) && (lookForClosingPar == null)) {
        // console.log("no: ')', '(' :", mixedArray[j])
        // console.log("lookForOpeningPar", lookForOpeningPar)
        // console.log("lookForClosingPar", lookForClosingPar)
        // console.log(mixedArray)
        // console.log()


      }
    }
    // console.log("mixedArray end of j: ", mixedArray)
    // console.log("originalstring:", originalstring)
  }

  for (let n = 0; n < mixedArray.length; n++) {

    if (typeof mixedArray[n] == "string") {

      mixedArray[n] = conjunctionCheck(mixedArray[n])

    }


  }


  return mixedArray
}