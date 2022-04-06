const roundToInteger = (value) => Math.round(value + Number.EPSILON);
const roundToDecimalPlaces = (value, places = 2) =>
  Math.round(value * 10 ** places) / 10 ** places;

module.exports = {
  roundToInteger,
  roundToDecimalPlaces,
};
