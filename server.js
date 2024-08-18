var express = require('express')
var app = express()
var exphbs = require("express-handlebars")
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
var hbs = exphbs.create({});

hbs.handlebars.registerHelper('idxChecker', function (targetidx, classidx) {
    return targetidx == classidx;
});

const zmq = require('zeromq');
async function callPrereqChecker() {
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:4444');

    console.log("classDataAdded.classes: ", classDataAdded.classes)
    var jsonReq = {"planned": []}
    jsonReq["planned"] = classDataAdded.classes

    await sock.send(JSON.stringify(jsonReq));
    // var jsonObject={"AdvisorId" : "71864", "Phone": "952-921-4972"} ;
    // var stringObject=JSON.stringify(jsonObject);
    // sock.send(stringObject);
    const [result] = await sock.receive();

    console.log('Received ', result.toString());
    // return result;
    return JSON.parse(result.toString());
}

function unnestToString(prereqArray) {
    var prereqString = ""
    console.log(prereqArray)
    if (prereqArray.length > 1) {
        for (var i = 0; i < (prereqArray.length - 1); i++) {
            if (Array.isArray(prereqArray[i])) {
                prereqString = prereqString + combineWithOr((prereqArray[i])) + " and "
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
    var prereqSubString = ""
    console.log(prereqSubArray)
    console.log(prereqSubArray.length)

    if (prereqSubArray.length > 1) {
        prereqSubString = "("
        for (var i = 0; i < (prereqSubArray.length - 1); i++) {
            prereqSubString = prereqSubString + prereqSubArray[i] + " or "
        }
        prereqSubString = prereqSubString + prereqSubArray[prereqSubArray.length - 1] + ")"
        console.log("multi element: ", prereqSubString)

    } else if ((prereqSubArray.length == 1) && (Array.isArray(prereqSubArray[0]))) {
        prereqSubString = combineWithOr(prereqSubArray[0])
        console.log("single nested element: ", prereqSubString)
        console.log("single nested element: ", prereqSubArray[0])
        console.log("single nested element: ", prereqSubArray)
    } else {
        prereqSubString = prereqSubArray[0]
        console.log("non nested, single element: ", prereqSubString)
        console.log("non nested, single element: ", prereqSubArray[0])
    }

    // console.log(prereqSubString)

    return prereqSubString

}

var fs = require('fs');
var bodyParser = require('body-parser')
var classDataCS = require("./classData/CSData.json")
var classDataMTH = require("./classData/MTHData.json")

var classDataAggregate = [];
var classDataAdded = require("./addedClassData.json")

var classDataMissing = { "classes": [] }
var classDataMisordered = { "classes": [] }

const dataNamesAggregate = fs.readdirSync("./classData");
for (const name of dataNamesAggregate) {
    currJSON = require("./classData/" + name)
    classDataAggregate = classDataAggregate.concat(currJSON);
    // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
}


// middleware
app.use(express.static('static'))
app.use(express.json())

app.listen(3000, function () {
    console.log("== Server is listening on port 3000");
});

app.post('/POSTTOSERVER', function (req, res, next) {
    classDataAdded.classes.push(req.body);
    console.log(req.body)
    fs.writeFileSync("./addedClassData.json", JSON.stringify(classDataAdded));
    res.status(200).json(JSON.stringify(classDataAdded));
    // console.log(classDataAdded)
})

app.post('/CLEARPLAN', function (req, res, next) {
    fs.writeFileSync("./addedClassData.json", '{"classes":[]}');
    fs.writeFileSync("./misorderedClasses.json", '{"classes":[]}');
    fs.writeFileSync("./missingClasses.json", '{"classes":[]}');
    res.status(200);
    classDataAdded = { "classes": [] }
    classDataMissing = { "classes": [] }
    classDataMisordered = { "classes": [] }
})

app.get('', function (req, res, next) {
    res.status(200).render("home")
})

app.get('/classdata', function (req, res, next) {
    res.status(200).render("classdata")
})

app.get('/home.html', function (req, res, next) {
    res.status(200).render("home")
})

app.get('/review', async (req, res) => {
    var resultJSON = await callPrereqChecker()
    // console.log("resultJSON: ", resultJSON)
    console.log("resultJSON.misorderedClasses: ", resultJSON.misorderedClasses)
    console.log("resultJSON.missingClasses: ", resultJSON.missingClasses)
    for (var i = 0; i < (resultJSON.misorderedClasses.length); i++) {
        if (Array.isArray(resultJSON.misorderedClasses[i].misorderedPrereq)) {
            resultJSON.misorderedClasses[i].misorderedPrereqs = unnestToString(resultJSON.misorderedClasses[i].misorderedPrereqs)
        }
    }
    for (var i = 0; i < (resultJSON.missingClasses.length); i++) {
        if (Array.isArray(resultJSON.missingClasses[i].courseID)) {
            resultJSON.missingClasses[i].courseID = unnestToString(resultJSON.missingClasses[i].courseID)
        }
    }

    res.status(200).render("review", {
        misorderedClasses: resultJSON.misorderedClasses,
        missingClasses: resultJSON.missingClasses
    })
})

app.get('/review.html', async (req, res) => {
    var resultJSON = await callPrereqChecker()
    // console.log("resultJSON: ", resultJSON)
    console.log("resultJSON.misorderedClasses: ", resultJSON.misorderedClasses)
    console.log("resultJSON.missingClasses: ", resultJSON.missingClasses)

    res.status(200).render("review", {
        misorderedClasses: resultJSON.misorderedClasses,
        missingClasses: resultJSON.missingClasses
    })
})

app.get('/planner', function (req, res, next) {
    res.status(200).render("planner", {
        classes: classDataAggregate,
        addedClasses: classDataAdded.classes
    })
})

app.get('/planner.html', function (req, res, next) {
    res.status(200).render("planner", {
        classes: classDataAggregate,
        addedClasses: classDataAdded.classes
    })
})

app.post('/URLFORPREREQS', function (req, res, next) {
    // console.log("POST request body: ", req.body.courseArray);
    res.status(200).send()
    fs.writeFileSync("./classData/CSData.json", JSON.stringify(req.body.courseArray));
    for (const name of dataNamesAggregate) {
        currJSON = require("./classData/" + name)
        classDataAggregate = classDataAggregate.concat(currJSON);
        // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
    }

})

// app.get('/classDataCS', function (req, res, next) {
//     res.status(200).json(JSON.stringify(classDataCS));
// })

// app.get('/classDataMTH', function (req, res, next) {
//     res.status(200).json(JSON.stringify(classDataMTH));
// })


// app.post('/CSDATA', function (req, res, next) {
//     // console.log("POST request body: ", req.body.courseArray);
//     res.status(200).send()
//     fs.writeFileSync("./classData/CSData.json", JSON.stringify(req.body.courseArray));
//     for (const name of dataNamesAggregate) {
//         currJSON = require("./classData/" + name)
//         classDataAggregate = classDataAggregate.concat(currJSON);
//         // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
//     }

// })

// app.post('/MTHDATA', function (req, res, next) {
//     // console.log("POST request body: ", req.body.courseArray);
//     res.status(200).send()
//     fs.writeFileSync("./classData/MTHData.json", JSON.stringify(req.body.courseArray));
//     const dataNamesAggregate = fs.readdirSync("./classData");
//     for (const name of dataNamesAggregate) {
//         currJSON = require("./classData/" + name)
//         classDataAggregate = classDataAggregate.concat(currJSON);
//         // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
//     }
// 
// })