var fs = require('fs');
var bodyParser = require('body-parser');
const { lookupService } = require('dns/promises');

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
    for (var i = 38; i < 39; i += 1) {
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
          for (var j = 6; j < 7; j += 1) {
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
            // console.log(classHTMLArray[j][0])
            var regCoursePrereqBlock = /<p class="courseblockextra noindent">.+?(?=<.p>)/gm
            // console.log("classHTMLArray[j][0]", classHTMLArray[j][0])
            var coursePrereqSourceStrings = classHTMLArray[j][0].match(regCoursePrereqBlock)

            if (coursePrereqSourceStrings !== null) {
              // console.log("coursePrereqSourceStrings: ", coursePrereqSourceStrings)
              // console.log("coursePrereqSourceStrings.length: ", coursePrereqSourceStrings.length)
              // console.log()

              // can be multiple array items for reccomended courses, equivilents, and how many times a course is repeatable
              for (var l = 0; l < coursePrereqSourceStrings.length; l += 1) {

                // if statement to filter out elements on non-prerequisite topics
                if (coursePrereqSourceStrings[l].includes("Prerequisite")) {

                  var regPrereqString = />(?!<).+?(?=<)/gm
                  var coursePrereqStringArray = (coursePrereqSourceStrings[l] + "<").match(regPrereqString)
                  var coursePrereqString = ""
                  // console.log("coursePrereqSourceStrings: ", coursePrereqSourceStrings)
                  // console.log("coursePrereqSourceStrings.length: ", coursePrereqSourceStrings.length)
                  // console.log("coursePrereqStringArray: ", coursePrereqStringArray)

                  for (var k = 0; k < coursePrereqStringArray.length; k += 1) {
                    // console.log("coursePrereqStringArray[k] BEFORE: ", coursePrereqStringArray[k])

                    coursePrereqStringArray[k] = coursePrereqStringArray[k].substring(1)
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replace("or better", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replace("with C-", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replace("with C", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replace("[C-]", "").trim()
                    coursePrereqStringArray[k] = coursePrereqStringArray[k].replace("[C]", "").trim()
                    if ((coursePrereqStringArray[k].includes("Prerequisite:") == false) && (coursePrereqStringArray[k] != " ")) {
                      // console.log("coursePrereqStringArray[k]: ", coursePrereqStringArray[k])
                      coursePrereqString = coursePrereqString + coursePrereqStringArray[k]
                      // coursePrereqString = coursePrereqString.replace("\n", ' ').trim().replace(/\s\s+/g, ' ')
                    }
                  }
                  console.log()
                  console.log("coursePrereqString:", coursePrereqString)

                  // courseArrayDept[j].prereqs = processPrereqString("coursePrereqString")
                  courseArrayDept[j].prereqs = processPrereqString("ZY 99 or ((AB 123 and (CD 456 or BA 479)) and BIS 471 and ((CS 344 or CS 374) and CS 370))")

                }
                // console.log(courseArrayDept)

              }

              // coursePrereqStringArray[k]= coursePrereqStringArray[k][0]
            }
            // console.log(coursePrereqString)

            // console.log(coursePrereqStringArray)
            // console.log()
            // courseArrayDept.push()
          }
          // console.log(courseArrayDept)

        })
        .catch((error) => {
          console.log(error)
        });
    }
  })
  .catch((error) => {
    console.log(error)
  });


function processPrereqString(inputString) {
  var prereqArray = []
  var trySplitByParen = inputString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    prereqArray = unnest(inputString)
  }

  else {
    prereqArray = [conjunctionCheck(inputString)]
    console.log("+++++++++++++++++++++++")
  }

  console.log("prereqArray: ", prereqArray)
  return prereqArray
}

function unnest(nestedString) {
  prereqArray = []

  console.log("nestedString: ", nestedString)
  var trySplitByParen = nestedString.split(/\(([^()]+)\)/g)
  if ((Array.isArray(trySplitByParen)) && (trySplitByParen.length > 1)) {
    tempArray = trySplitByParen.filter(isEmpty)
    // console.log("tempArray: ", tempArray)
    console.log("*********************")
    // for (let i = 0; i < tempArray.length; i++) {
    // }
    console.log("inParenthesisArray Before: ", nestedString.match(/\(([^()]+)\)/g))
    inParenthesisArray = nestedString.match(/\(([^()]+)\)/g)
    for (let i = 0; i < inParenthesisArray.length; i++) {
      console.log(typeof inParenthesisArray[i])
      trim = inParenthesisArray[i]
      trim = trim.substring(1, (trim.length - 1))
      console.log(trim)
      processedElement = conjunctionCheck(trim)
      for (let j = 0; j < tempArray.length; j++) {
        if (tempArray[j] == trim) {
          tempArray[j] = processedElement
        }
      }
    }

    console.log("tempArray: ", tempArray)
    leftOfPar = []
    rightOfPar = []
    rightOfParIdx = []
    for (let j = 0; j < tempArray.length; j++) {
      console.log()
      console.log("j: ", j)

      if (typeof tempArray[j] == "string") {
        lookForOpeningPar = tempArray[j].match(/[(]/)
        lookForClosingPar = tempArray[j].match(/[)]/)

        console.log("close:", lookForClosingPar)
        console.log("open:", lookForOpeningPar)

        if ((lookForOpeningPar == null) && (lookForClosingPar != null) && (leftOfPar.length > 0)) {
          console.log("only close in string seg")
          console.log("before close:", tempArray[j].substring(0, lookForClosingPar.index))
          includedLeft = []
          for (let p = leftOfPar.length - 1; p > -1; p--) {
            // console.log("leftOfPar[p]: ", leftOfPar[p])
            if (typeof leftOfPar[p] == "string") {
              if (leftOfPar[p].match(/[(]/) != null) {
                p = -1
              }
            }
            includedLeft.push(leftOfPar.pop())
          }
          console.log("includedleft:", includedLeft)
          console.log()

        }
        else if ((lookForOpeningPar != null) && (lookForClosingPar != null)) {
          if (lookForClosingPar.index < lookForOpeningPar.index) {
            console.log("close then open in string seg")
            console.log("before close:", tempArray[j].substring(0, lookForClosingPar.index))
            includedLeft = []
            console.log("leftOfPar:", leftOfPar)
            for (let p = leftOfPar.length - 1; p > -1; p--) {
              console.log()
              console.log("leftOfPar:", leftOfPar)

              currEl = leftOfPar.pop()
              console.log("leftOfPar after pop:", leftOfPar)
              console.log("iterator type: ", typeof currEl)
              console.log("iterator: ", currEl)
              console.log("p: ", p)
              if (typeof currEl == "string") {
                // console.log("look for match", (currEl.match(/[(]/) != null))
                if (currEl.match(/[(]/) != null) {
                  p = -1
                  currEl = currEl.substring(currEl.match(/[(]/).index+1)
                }
              }
              leftOfPar = leftOfPar.slice(0, p)
              if( currEl != ""){
                includedLeft.unshift(currEl)
                console.log("pushing: ",currEl)
              }
            }
            console.log("leftOfPar:", leftOfPar)
            console.log("includedleft:", includedLeft)
            console.log()
          }
          else if (lookForClosingPar.index > lookForOpeningPar.index) {
            leftstartidx = 0
            while (lookForOpeningPar != null) {
              // console.log("lookForOpeningPar.index", lookForOpeningPar.index)
              console.log("pushing:", tempArray[j].substring(leftstartidx, lookForOpeningPar.index + 1))
              leftOfPar.push(tempArray[j].substring(leftstartidx, lookForOpeningPar.index + 1))
              remaining = remaining.substring(lookForOpeningPar.index + 1)
              console.log("remaining:", remaining)
              leftstartidx = lookForOpeningPar.index
              lookForOpeningPar = remaining.match(/[(]/)
            }


            console.log("open then close in string seg")
            console.log("leftOfPar to close:", leftOfPar)
            console.log("between open and close:", tempArray[j].substring(leftstartidx + 1, lookForClosingPar.index))
            console.log()
          }
        }
        else if ((lookForOpeningPar != null) && (lookForClosingPar == null)) {
          console.log("only open in string seg")
          console.log("before open:", tempArray[j].substring(0, lookForOpeningPar.index + 1))
          if (lookForOpeningPar.index > 0) {
            leftOfPar.push("("+tempArray[j].substring(0, lookForOpeningPar.index - 1))
          }
          
          // check for addtional opening pars
          remaining = tempArray[j].substring(lookForOpeningPar.index)
          lookForOpeningPar = remaining.match(/[(]/)
          leftstartidx = lookForOpeningPar.index
          while (lookForOpeningPar != null) {
            // console.log(leftstartidx)

            console.log("lookForOpeningPar", lookForOpeningPar)
            leftOfPar.push("("+tempArray[j].substring(leftstartidx, lookForOpeningPar.index - 1))
            remaining = remaining.substring(lookForOpeningPar.index + 1)
            leftstartidx = lookForOpeningPar.index
            lookForOpeningPar = remaining.match(/[(]/)
          }

          // console.log(leftstartidx)
          leftOfPar.push("("+remaining.substring(leftstartidx))
          console.log("leftOfPar:", leftOfPar)
          console.log()

        }
      }
      else {
        leftOfPar.push(tempArray[j])
      }
    }
    console.log("leftOfPar:", leftOfPar)
    console.log("rightOfPar", rightOfPar)


    containsAnd = false
    containsOr = false
    for (let j = 0; j < tempArray.length; j++) {
      if (typeof tempArray[j] == "string") {
        if ((tempArray[j].indexOf("and")) > -1) {
          containsAnd = true
          if (tempArray[j].trim() == "and") {
            console.log("just and: ", tempArray[j])
            tempArray.splice(j, 1)
          }
          else if ((tempArray[j].length - tempArray[j].indexOf("and") < 5)) {
            console.log("and at end of string: ", tempArray[j])
            split = tempArray[j].split("and")
            tempArray[j] = split[0]
          }
          else if (tempArray[j].indexOf("and") < 5) {
            console.log("and at begining of string: ", tempArray[j])
            split = tempArray[j].split("and")
            tempArray[j] = split[1]
          }
          tempArray.filter(isEmpty)
        }
      }
    }

    for (let j = 0; j < tempArray.length; j++) {
      if (typeof tempArray[j] == "string") {
        if ((tempArray[j].indexOf("or")) > -1) {
          containsOr = true
          if (tempArray[j].trim() == "or") {
            console.log("just or: ", tempArray[j])
            tempArray.splice(j, 1)
          }
          else if ((tempArray[j].length - tempArray[j].indexOf("or") < 4)) {
            console.log("and at end of string: ", tempArray[j])
            split = tempArray[j].split("or")
            tempArray[j] = split[0]
          }
          else if (tempArray[j].indexOf("or") < 4) {
            console.log("and at begining of string: ", tempArray[j])
            split = tempArray[j].split("or")
            tempArray[j] = split[1]
          }
          tempArray.filter(isEmpty)
        }
      }
    }


    if (containsAnd && containsOr) {
      console.log("ERROR, parenthesis unexpectedly contain both : 'and', 'or'.")
      console.log("tempArray: ", tempArray)
      // console.log("prereqArray: ", prereqArray)
    }
    else if (containsAnd) {
      prereqArray = [new Conjuction(tempArray)]
      console.log("prereqArray: ", prereqArray)

    }
    else if (containsOr) {
      prereqArray = [new Disjunction(tempArray)]
      console.log("prereqArray: ", prereqArray)

    }
    console.log("prereqArray in unnest function: ", prereqArray)

  }
  return prereqArray
}

function conjunctionCheck(stringC) {

  processedForConjunctions = stringC

  if (stringC.includes("and")) {

    // console.log("contains and: ", stringC)
    // console.log("and idx: ", stringC.indexOf("and"))
    // console.log("str len: ", stringC.length)
    // console.log("len - idx: ", stringC.length - stringC.indexOf("and"))

    if (stringC.split("and").filter(isEmpty).length > 1) {

      var split = stringC.split("and").filter(isEmpty).filter(isBetter)
      // console.log("contains and (split): ", split)
      // console.log("contains and (StringC): ", stringC)
      for (let u = 0; u < split.length; u++) {
        split[u] = split[u].replace("with C-", "").trim()
        split[u] = split[u].replace("with C", "").trim()
        split[u] = split[u].replace("or better", "").trim()
        split[u] = split[u].replace("[C-]", "").trim()
        split[u] = split[u].replace("[C]", "").trim()
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
      console.log("contains or (split): ", split)
      console.log("contains or (split): ", stringD)
      for (let w = 0; w < split.length; w++) {
        split[w] = split[w].replace("with C-", "").trim()
        split[w] = split[w].replace("with C", "").trim()
        split[w] = split[w].replace("or better", "").trim()
        split[w] = split[w].replace("[C-]", "").trim()
        split[w] = split[w].replace("[C]", "").trim()
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