const fs = require("fs");
const convert = require("xml-js");

const xml = fs.readFileSync("./jacoco.xml", "utf-8");

const xmlToJsObject = convert.xml2js(xml, { compact: true, spaces: 4 }); // seems kind of like parsing

console.log(xmlToJsObject);

const jacoco = require("@cvrg-report/jacoco-json");

// Parse by file path
jacoco
  .parseFile("./jacoco.xml")
  .then(function (result) {
    console.log(JSON.stringify(result));
  })
  .catch(function (err) {
    console.error(err);
  });

// Parse by file contents
// jacoco
//   .parseContent('<?xml version="1.0" ?><report>...</report>')
//   .then(function (result) {
//     console.log(JSON.stringify(result));
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
