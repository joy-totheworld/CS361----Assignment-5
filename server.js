var express = require('express')
var app = express()
var fs = require('fs');
var classDataCS = require("./CSData.json")
var classDataMTH = require("./MTHData.json")



// middleware
app.use(express.static('static'))
app.use(express.json())

app.listen(3000, function () {
	console.log("== Server is listening on port 3000");
});

app.get('', function (req, res, next) {
    res.status(200).sendFile(__dirname + '/static/home.html')
})

app.get('/classDataCS', function (req, res, next) {
    res.status(200).json(JSON.stringify(classDataCS));
})

app.get('/classDataMTH', function (req, res, next) {
    res.status(200).json(JSON.stringify(classDataMTH));
})


app.post('/CSDATA', function (req, res, next) {
    console.log("POST request body: ",req.body.courseArray);
    res.status(200).send()
    fs.writeFileSync("./CSData.json", JSON.stringify(req.body.courseArray));

})

app.post('/MTHDATA', function (req, res, next) {
    console.log("POST request body: ",req.body.courseArray);
    res.status(200).send()
    fs.writeFileSync("./MTHData.json", JSON.stringify(req.body.courseArray));

})