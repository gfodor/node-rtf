var Element = require("./element");
var Format = require("../format");
var async = require("async");

let ListElement;

module.exports = ListElement = function (items) {
  Element.apply(this, [new Format()]);
  this.items = items;
};

ListElement.subclass(Element);

ListElement.prototype.getRTFCode = function (colorTable, fontTable, callback) {
  const itemTasks = this.items.map(
    (item) => (cb) => item.getRTFCode(colorTable, fontTable, cb)
  );
  return async.parallel(itemTasks, (err, results) => {
    callback(
      null,
      `{{\\*\\pn\\pnlvlblt\\pnf1\\pnindent0{\\pntxtb\\'B7}}\\fi-360\\li720\\sa200\\sl276\\slmult1\\lang22\\f0\\fs22{\\pntext\\tab}${results.join(
        "\\par"
      )}\\par}`
    );
  });
};
