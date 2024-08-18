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
    return result.toString();
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

app.get('/home.html', function (req, res, next) {
    res.status(200).render("home")
})

app.get('/review', function (req, res, next) {
    resultJSON = callPrereqChecker()
    res.status(200).render("review")
    // res.status(200).render("review", {
    //     missingClasses: classDataMissing.classes,
    //     missorderedClasses: classDataMisordered.classes
    // })
})

app.get('/review.html', function (req, res, next) {
    resultJSON = callPrereqChecker()
    res.status(200).render("review")
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

app.get('/classDataCS', function (req, res, next) {
    res.status(200).json(JSON.stringify(classDataCS));
})

app.get('/classDataMTH', function (req, res, next) {
    res.status(200).json(JSON.stringify(classDataMTH));
})


app.post('/CSDATA', function (req, res, next) {
    // console.log("POST request body: ", req.body.courseArray);
    res.status(200).send()
    fs.writeFileSync("./classData/CSData.json", JSON.stringify(req.body.courseArray));
    for (const name of dataNamesAggregate) {
        currJSON = require("./classData/" + name)
        classDataAggregate = classDataAggregate.concat(currJSON);
        // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
    }

})

app.post('/MTHDATA', function (req, res, next) {
    // console.log("POST request body: ", req.body.courseArray);
    res.status(200).send()
    fs.writeFileSync("./classData/MTHData.json", JSON.stringify(req.body.courseArray));
    const dataNamesAggregate = fs.readdirSync("./classData");
    for (const name of dataNamesAggregate) {
        currJSON = require("./classData/" + name)
        classDataAggregate = classDataAggregate.concat(currJSON);
        // fs.writeFileSync("./classDataAggregate.json", JSON.stringify(classDataAggregate));
    }

})