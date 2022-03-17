var Element = require("./element");

let LinkElement;

module.exports = LinkElement = function (text, url, format) {
  Element.apply(this, [format]);
  this.text = text;
  this.url = url;
};

LinkElement.subclass(Element);

LinkElement.prototype.getRTFCode = function (colorTable, fontTable, callback) {
  return callback(
    null,
    '{\\field{\\*\\fldinst HYPERLINK "' +
      this.url +
      '"}{\\fldrslt' +
      this.format.formatText(this.text, colorTable, fontTable) +
      "}}"
  );
};
