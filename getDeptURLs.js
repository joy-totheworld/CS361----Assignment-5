var fs = require('fs');
var bodyParser = require('body-parser')

// credit for following function, referenced:
// https://stackoverflow.com/questions/6375461/get-html-code-using-javascript-with-a-url
async function getHTMLString(url) {
  var response = await fetch(url);
  switch (response.status) {
    // status "OK"
    case 200:
      var template = await response.text();
      return template
    // status "Not Found"
    case 404:
      console.log('Not Found');
      break;
  }
}

(async () => {

  // getting array of urls
  var catalogHTMLstring = await getHTMLString('https://catalog.oregonstate.edu/courses/')
  var re = /<li><a href=".courses.[a-zA-Z]*.">/gm
  var found = [...catalogHTMLstring.matchAll(re)]
  linkStrings = []
  for (var i = 0; i < found.length; i += 1) {
    linkStrings.push(found[i][0])
    linkStrings[i] = "https://catalog.oregonstate.edu"+linkStrings[i].substring(13, (linkStrings[i].length - 2))
  }
  console.log(linkStrings);

  for (var i = 0; i < linkStrings.length; i += 1) {
    setTimeout(() => {}, 1000);
    console.log(linkStrings[i])
    var deptHTML = await getHTMLString(linkStrings[i])
  }

})();

