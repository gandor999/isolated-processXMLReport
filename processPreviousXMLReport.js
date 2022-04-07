const fs = require("fs");
const convert = require("xml-js");

const xml = fs.readFileSync("./jacoco-sample.xml", "utf-8");
const xml2 = fs.readFileSync("./jacoco-sample-2.xml", "utf-8");

const xmlToJsObject = convert.xml2js(xml, { compact: true, spaces: 4 }); // seems kind of like parsing
const xmlToJsObject2 = convert.xml2js(xml2, { compact: true, spaces: 4 });

console.log(xmlToJsObject.report.counter);
console.log(xmlToJsObject2.report.counter);

const { roundToDecimalPlaces, roundToInteger } = require("./util");

const processPreviousXMLReport = (currentXMLReport, previousXMLReport) => {
  const { counter } = currentXMLReport;

  const acc = {
    currentCoverageSum: 0,
    previousCoverageSum: 0,
    elements: [],
  };

  acc.currentCoverageSum = counter.reduce(
    (coverage, currentValue, currentIndex) => {
      const currentPercent =
        (parseFloat(currentValue._attributes.covered) /
          (parseFloat(currentValue._attributes.missed) +
            parseFloat(currentValue._attributes.covered))) *
        100;

      console.log("current percent: " + currentPercent);

      const previousPercent =
        (parseFloat(
          previousXMLReport.counter[currentIndex]._attributes.covered
        ) /
          (parseFloat(
            previousXMLReport.counter[currentIndex]._attributes.missed
          ) +
            parseFloat(
              previousXMLReport.counter[currentIndex]._attributes.covered
            ))) *
        100;

      const total =
        parseInt(currentValue._attributes.covered) +
        parseInt(currentValue._attributes.missed);

      acc.elements.push({
        type: previousXMLReport.counter[currentIndex]._attributes.type,
        total: total,
        previousPercent: previousPercent,
        currentPercent: currentPercent,
        change: roundToDecimalPlaces(currentPercent - previousPercent, 2),
        risk: 0,
      });

      acc.previousCoverageSum += previousPercent;

      return coverage + currentPercent;
    },
    0
  );

  console.log(acc.currentCoverageSum);
  console.log(acc.previousCoverageSum);

  const currentAverageCoverage = acc.currentCoverageSum / acc.elements.length;
  const previousAverageCoverage = acc.previousCoverageSum / acc.elements.length;
  const totalCoverageDelta = currentAverageCoverage - previousAverageCoverage;
  const roundedDelta = roundToDecimalPlaces(totalCoverageDelta, 2);
  const coverageDeltaRisk =
    totalCoverageDelta < 0 ? roundToInteger(totalCoverageDelta * -1) : 0;

  acc.elements.push({
    type: "Average Coverage",
    previousPercent: roundToDecimalPlaces(previousAverageCoverage, 2),
    currentPercent: roundToDecimalPlaces(currentAverageCoverage, 2),
    change: roundedDelta,
    risk: coverageDeltaRisk,
  });

  return {
    riskCalculation: [
      {
        title: "Change in Coverage Risk",
        id: "coverageChangeRisk",
        elementKeys: [
          "type",
          "previousPercent",
          "currentPercent",
          "change",
          "risk",
        ],
        elements: acc.elements,
        total: coverageDeltaRisk,
      },
    ],
    pluginMessage: ` - Coverage ${
      roundedDelta < 0 ? "decreased" : "increased"
    } by ${Math.abs(roundedDelta)}%`,
  };
};

console.log(
  processPreviousXMLReport(xmlToJsObject.report, xmlToJsObject2.report)
);

module.exports = {
  processPreviousXMLReport,
};
