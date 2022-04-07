const fs = require("fs");
const convert = require("xml-js");

const xml = fs.readFileSync("./jacoco-sample.xml", "utf-8");

const xmlToJsObject = convert.xml2js(xml, { compact: true, spaces: 4 }); // seems kind of like parsing

console.log(xmlToJsObject.report.counter);

const { roundToDecimalPlaces, roundToInteger } = require("./util");

// recreate processXMLReport for xml js object
const processXMLReport = (xmlToJsObject) => {
  const { counter } = xmlToJsObject;

  const acc = {
    coverageSum: 0,
    elements: [],
  };

  acc.coverageSum = counter.reduce((coverage, currentValue) => {
    acc.elements.push({
      type: currentValue._attributes.type,
      total:
        parseInt(currentValue._attributes.covered) +
        parseInt(currentValue._attributes.missed),

      covered: currentValue._attributes.covered,
      skipped: null,
      percent:
        (parseFloat(currentValue._attributes.covered) /
          (parseFloat(currentValue._attributes.missed) +
            parseFloat(currentValue._attributes.covered))) *
        100,
      risk: 0,
    });
    return (
      coverage +
      (parseFloat(currentValue._attributes.covered) /
        (parseFloat(currentValue._attributes.missed) +
          parseFloat(currentValue._attributes.covered))) *
        100
    );
  }, 0);

  const averageCoverage = acc.coverageSum / (acc.elements.length || 1);
  const roundedAverageCoverage = roundToDecimalPlaces(averageCoverage);
  const coverageRisk = roundToInteger(100 - averageCoverage);

  acc.elements.push({
    type: "Average Coverage",
    percent: roundedAverageCoverage,
    risk: coverageRisk,
  });

  return {
    riskCalculation: [
      {
        title: "Test Coverage Risk",
        id: "coverageRisk",
        elementKeys: ["type", "total", "covered", "skipped", "percent", "risk"],
        elements: acc.elements,
        total: coverageRisk,
      },
    ],
    pluginMessage: `Average test coverage of ${roundedAverageCoverage}%`,
  };
};

console.log(processXMLReport(xmlToJsObject.report));
