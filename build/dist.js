var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// lib/fonts.js
var require_fonts = __commonJS({
  "lib/fonts.js"(exports, module) {
    module.exports = {
      ARIAL: "Arial",
      COMIC_SANS: "Comic Sans MS",
      GEORGIA: "Georgia",
      IMPACT: "Impact",
      TAHOMA: "Tahoma",
      HELVETICA: "Helvetica",
      VERDANA: "Verdana",
      COURIER_NEW: "Courier New",
      PALATINO: "Palatino Linotype",
      TIMES_NEW_ROMAN: "Times New Roman"
    };
  }
});

// lib/rtf-utils.js
var require_rtf_utils = __commonJS({
  "lib/rtf-utils.js"(exports) {
    var Fonts = require_fonts();
    String.prototype.replaceAll = function(token, newToken, ignoreCase) {
      var str = this.toString(), i = -1;
      if (typeof token === "string") {
        if (ignoreCase === true) {
          while ((i = str.toLowerCase().indexOf(token, i >= 0 ? i + newToken.length : 0)) !== -1) {
            str = str.substring(0, i).concat(newToken).concat(str.substring(i + token.length));
          }
        } else {
          return this.split(token).join(newToken);
        }
      }
      return str;
    };
    function getRTFSafeText(text) {
      if (typeof text === "object" && Object.hasOwn(text, "safe") && !text.safe) {
        return text.text;
      }
      return text.replaceAll("\\", "\\\\").replaceAll("{", "\\{").replaceAll("}", "\\}").replaceAll("~", "\\~").replaceAll("-", "\\-").replaceAll("_", "\\_").replaceAll("\n\r", " \\line ").replaceAll("\n", " \\line ").replaceAll("\r", " \\line ");
    }
    function createColorTable(colorTable) {
      var table = "", c;
      table += "{\\colortbl;";
      for (c = 0; c < colorTable.length; c++) {
        let rgb = colorTable[c];
        table += "\\red" + rgb.red + "\\green" + rgb.green + "\\blue" + rgb.blue + ";";
      }
      table += "}";
      return table;
    }
    function createFontTable(fontTable) {
      var table = "", f;
      table += "{\\fonttbl;";
      if (fontTable.length === 0) {
        table += "{\\f0 " + Fonts.ARIAL + "}";
      } else {
        for (f = 0; f < fontTable.length; f++) {
          table += "{\\f" + f + " " + fontTable[f] + "}";
        }
      }
      table += "}";
      return table;
    }
    exports.getRTFSafeText = getRTFSafeText;
    exports.createColorTable = createColorTable;
    exports.createFontTable = createFontTable;
  }
});

// lib/rgb.js
var require_rgb = __commonJS({
  "lib/rgb.js"(exports, module) {
    module.exports = function(red, green, blue) {
      this.red = red;
      this.green = green;
      this.blue = blue;
    };
  }
});

// lib/format.js
var require_format = __commonJS({
  "lib/format.js"(exports, module) {
    var Utils = require_rtf_utils();
    var RGB = require_rgb();
    var Fonts = require_fonts();
    var Format;
    module.exports = Format = function() {
      this.underline = false;
      this.bold = false;
      this.italic = false;
      this.strike = false;
      this.superScript = false;
      this.subScript = false;
      this.bulleted = false;
      this.makeParagraph = false;
      this.align = "";
      this.leftIndent = 0;
      this.rightIndent = 0;
      this.font = Fonts.ARIAL;
      this.fontSize = 0;
      this.colorPos = -1;
      this.backgroundColorPos = -1;
      this.fontPos = -1;
    };
    function getColorPosition(table, find) {
      if (find !== void 0 && find instanceof RGB) {
        table.forEach(function(color, index) {
          if (color.red === find.red && color.green === find.green && color.blue === find.blue) {
            return index;
          }
        });
      }
      return -1;
    }
    Format.prototype.updateTables = function(colorTable, fontTable) {
      this.fontPos = fontTable.indexOf(this.font);
      this.colorPos = getColorPosition(colorTable, this.color);
      this.backgroundColorPos = getColorPosition(colorTable, this.backgroundColor);
      if (this.fontPos < 0 && this.font !== void 0 && this.font.length > 0) {
        fontTable.push(this.font);
        this.fontPos = fontTable.length - 1;
      }
      if (this.colorPos < 0 && this.color !== void 0) {
        colorTable.push(this.color);
        this.colorPos = colorTable.length;
      }
      if (this.backgroundColorPos < 0 && this.backgroundColor !== void 0) {
        colorTable.push(this.backgroundColor);
        this.backgroundColorPos = colorTable.length;
      }
    };
    function wrap(text, rtfwrapper) {
      return rtfwrapper + " " + text + rtfwrapper + "0";
    }
    Format.prototype.formatText = function(text, colorTable, fontTable, safeText) {
      this.updateTables(colorTable, fontTable);
      var rtf = "{";
      if (this.makeParagraph)
        rtf += "\\pard";
      if (this.fontPos !== void 0 && this.fontPos >= 0)
        rtf += "\\f" + this.fontPos.toString();
      if (this.backgroundColorPos !== void 0 && this.backgroundColorPos >= 0)
        rtf += "\\cb" + (this.backgroundColorPos + 1).toString();
      if (this.colorPos !== void 0 && this.colorPos >= 0)
        rtf += "\\cf" + this.colorPos.toString();
      if (this.fontSize > 0)
        rtf += "\\fs" + (this.fontSize * 2).toString();
      if (this.align.length > 0)
        rtf += this.align;
      if (this.leftIndent > 0)
        rtf += "\\li" + (this.leftIndent * 20).toString();
      if (this.rightIndent > 0)
        rtf += "\\ri" + this.rightIndent.toString();
      if (this.bulleted)
        rtf += "{\\listtext	\\uc0\\u8226 	}";
      var content = "";
      if (safeText === void 0 || safeText) {
        content += Utils.getRTFSafeText(text);
      } else {
        content += text;
      }
      if (this.bold)
        content = wrap(content, "\\b");
      if (this.italic)
        content = wrap(content, "\\i");
      if (this.underline)
        content = wrap(content, "\\ul");
      if (this.strike)
        content = wrap(content, "\\strike");
      if (this.subScript)
        content = wrap(content, "\\sub");
      if (this.superScript)
        content = wrap(content, "\\super");
      rtf += content;
      if (this.bulleted)
        rtf += "\\\n";
      if (this.makeParagraph)
        rtf += "\\par";
      rtf += "}";
      return rtf;
    };
  }
});

// lib/elements/element.js
var require_element = __commonJS({
  "lib/elements/element.js"(exports, module) {
    var Format = require_format();
    Function.prototype.subclass = function(base) {
      var c = Function.prototype.subclass.nonconstructor;
      c.prototype = base.prototype;
      this.prototype = new c();
    };
    Function.prototype.subclass.nonconstructor = function() {
    };
    module.exports = function(format) {
      if (format === void 0)
        format = new Format();
      this.format = format;
    };
  }
});

// lib/language.js
var require_language = __commonJS({
  "lib/language.js"(exports, module) {
    module.exports = {
      ENG_US: "1033",
      SP_MX: "2058",
      FR: "1036",
      NONE: "1024"
    };
  }
});

// lib/orientation.js
var require_orientation = __commonJS({
  "lib/orientation.js"(exports, module) {
    module.exports = {
      PORTRAIT: false,
      LANDSCAPE: true
    };
  }
});

// lib/elements/text.js
var require_text = __commonJS({
  "lib/elements/text.js"(exports, module) {
    var Element = require_element();
    var TextElement;
    module.exports = TextElement = function(text, format) {
      Element.apply(this, [format]);
      this.text = text;
    };
    TextElement.subclass(Element);
    TextElement.prototype.getRTFCode = function(colorTable, fontTable, callback) {
      return callback(null, this.format.formatText(this.text, colorTable, fontTable));
    };
  }
});

// lib/elements/link.js
var require_link = __commonJS({
  "lib/elements/link.js"(exports, module) {
    var Element = require_element();
    var LinkElement;
    module.exports = LinkElement = function(text, url, format) {
      Element.apply(this, [format]);
      this.text = text;
      this.url = url;
    };
    LinkElement.subclass(Element);
    LinkElement.prototype.getRTFCode = function(colorTable, fontTable, callback) {
      return callback(null, '{\\field{\\*\\fldinst HYPERLINK "' + this.url + '"}{\\fldrslt' + this.format.formatText(this.text, colorTable, fontTable) + "}}");
    };
  }
});

// node_modules/async/lib/async.js
var require_async = __commonJS({
  "node_modules/async/lib/async.js"(exports, module) {
    (function() {
      var async = {};
      var root, previous_async;
      root = this;
      if (root != null) {
        previous_async = root.async;
      }
      async.noConflict = function() {
        root.async = previous_async;
        return async;
      };
      function only_once(fn) {
        var called = false;
        return function() {
          if (called)
            throw new Error("Callback was already called.");
          called = true;
          fn.apply(root, arguments);
        };
      }
      var _toString = Object.prototype.toString;
      var _isArray = Array.isArray || function(obj) {
        return _toString.call(obj) === "[object Array]";
      };
      var _each = function(arr, iterator) {
        for (var i = 0; i < arr.length; i += 1) {
          iterator(arr[i], i, arr);
        }
      };
      var _map = function(arr, iterator) {
        if (arr.map) {
          return arr.map(iterator);
        }
        var results = [];
        _each(arr, function(x, i, a) {
          results.push(iterator(x, i, a));
        });
        return results;
      };
      var _reduce = function(arr, iterator, memo) {
        if (arr.reduce) {
          return arr.reduce(iterator, memo);
        }
        _each(arr, function(x, i, a) {
          memo = iterator(memo, x, i, a);
        });
        return memo;
      };
      var _keys = function(obj) {
        if (Object.keys) {
          return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
          if (obj.hasOwnProperty(k)) {
            keys.push(k);
          }
        }
        return keys;
      };
      if (typeof process === "undefined" || !process.nextTick) {
        if (typeof setImmediate === "function") {
          async.nextTick = function(fn) {
            setImmediate(fn);
          };
          async.setImmediate = async.nextTick;
        } else {
          async.nextTick = function(fn) {
            setTimeout(fn, 0);
          };
          async.setImmediate = async.nextTick;
        }
      } else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== "undefined") {
          async.setImmediate = function(fn) {
            setImmediate(fn);
          };
        } else {
          async.setImmediate = async.nextTick;
        }
      }
      async.each = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        _each(arr, function(x) {
          iterator(x, only_once(done));
        });
        function done(err) {
          if (err) {
            callback(err);
            callback = function() {
            };
          } else {
            completed += 1;
            if (completed >= arr.length) {
              callback();
            }
          }
        }
      };
      async.forEach = async.each;
      async.eachSeries = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        var iterate = function() {
          iterator(arr[completed], function(err) {
            if (err) {
              callback(err);
              callback = function() {
              };
            } else {
              completed += 1;
              if (completed >= arr.length) {
                callback();
              } else {
                iterate();
              }
            }
          });
        };
        iterate();
      };
      async.forEachSeries = async.eachSeries;
      async.eachLimit = function(arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
      };
      async.forEachLimit = async.eachLimit;
      var _eachLimit = function(limit) {
        return function(arr, iterator, callback) {
          callback = callback || function() {
          };
          if (!arr.length || limit <= 0) {
            return callback();
          }
          var completed = 0;
          var started = 0;
          var running = 0;
          (function replenish() {
            if (completed >= arr.length) {
              return callback();
            }
            while (running < limit && started < arr.length) {
              started += 1;
              running += 1;
              iterator(arr[started - 1], function(err) {
                if (err) {
                  callback(err);
                  callback = function() {
                  };
                } else {
                  completed += 1;
                  running -= 1;
                  if (completed >= arr.length) {
                    callback();
                  } else {
                    replenish();
                  }
                }
              });
            }
          })();
        };
      };
      var doParallel = function(fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [async.each].concat(args));
        };
      };
      var doParallelLimit = function(limit, fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
      };
      var doSeries = function(fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [async.eachSeries].concat(args));
        };
      };
      var _asyncMap = function(eachfn, arr, iterator, callback) {
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        if (!callback) {
          eachfn(arr, function(x, callback2) {
            iterator(x.value, function(err) {
              callback2(err);
            });
          });
        } else {
          var results = [];
          eachfn(arr, function(x, callback2) {
            iterator(x.value, function(err, v) {
              results[x.index] = v;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async.map = doParallel(_asyncMap);
      async.mapSeries = doSeries(_asyncMap);
      async.mapLimit = function(arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
      };
      var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
      };
      async.reduce = function(arr, memo, iterator, callback) {
        async.eachSeries(arr, function(x, callback2) {
          iterator(memo, x, function(err, v) {
            memo = v;
            callback2(err);
          });
        }, function(err) {
          callback(err, memo);
        });
      };
      async.inject = async.reduce;
      async.foldl = async.reduce;
      async.reduceRight = function(arr, memo, iterator, callback) {
        var reversed = _map(arr, function(x) {
          return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
      };
      async.foldr = async.reduceRight;
      var _filter = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      };
      async.filter = doParallel(_filter);
      async.filterSeries = doSeries(_filter);
      async.select = async.filter;
      async.selectSeries = async.filterSeries;
      var _reject = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (!v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      };
      async.reject = doParallel(_reject);
      async.rejectSeries = doSeries(_reject);
      var _detect = function(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function(x, callback) {
          iterator(x, function(result) {
            if (result) {
              main_callback(x);
              main_callback = function() {
              };
            } else {
              callback();
            }
          });
        }, function(err) {
          main_callback();
        });
      };
      async.detect = doParallel(_detect);
      async.detectSeries = doSeries(_detect);
      async.some = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (v) {
              main_callback(true);
              main_callback = function() {
              };
            }
            callback();
          });
        }, function(err) {
          main_callback(false);
        });
      };
      async.any = async.some;
      async.every = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (!v) {
              main_callback(false);
              main_callback = function() {
              };
            }
            callback();
          });
        }, function(err) {
          main_callback(true);
        });
      };
      async.all = async.every;
      async.sortBy = function(arr, iterator, callback) {
        async.map(arr, function(x, callback2) {
          iterator(x, function(err, criteria) {
            if (err) {
              callback2(err);
            } else {
              callback2(null, { value: x, criteria });
            }
          });
        }, function(err, results) {
          if (err) {
            return callback(err);
          } else {
            var fn = function(left, right) {
              var a = left.criteria, b = right.criteria;
              return a < b ? -1 : a > b ? 1 : 0;
            };
            callback(null, _map(results.sort(fn), function(x) {
              return x.value;
            }));
          }
        });
      };
      async.auto = function(tasks, callback) {
        callback = callback || function() {
        };
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
          return callback();
        }
        var results = {};
        var listeners = [];
        var addListener = function(fn) {
          listeners.unshift(fn);
        };
        var removeListener = function(fn) {
          for (var i = 0; i < listeners.length; i += 1) {
            if (listeners[i] === fn) {
              listeners.splice(i, 1);
              return;
            }
          }
        };
        var taskComplete = function() {
          remainingTasks--;
          _each(listeners.slice(0), function(fn) {
            fn();
          });
        };
        addListener(function() {
          if (!remainingTasks) {
            var theCallback = callback;
            callback = function() {
            };
            theCallback(null, results);
          }
        });
        _each(keys, function(k) {
          var task = _isArray(tasks[k]) ? tasks[k] : [tasks[k]];
          var taskCallback = function(err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
              args = args[0];
            }
            if (err) {
              var safeResults = {};
              _each(_keys(results), function(rkey) {
                safeResults[rkey] = results[rkey];
              });
              safeResults[k] = args;
              callback(err, safeResults);
              callback = function() {
              };
            } else {
              results[k] = args;
              async.setImmediate(taskComplete);
            }
          };
          var requires = task.slice(0, Math.abs(task.length - 1)) || [];
          var ready = function() {
            return _reduce(requires, function(a, x) {
              return a && results.hasOwnProperty(x);
            }, true) && !results.hasOwnProperty(k);
          };
          if (ready()) {
            task[task.length - 1](taskCallback, results);
          } else {
            var listener = function() {
              if (ready()) {
                removeListener(listener);
                task[task.length - 1](taskCallback, results);
              }
            };
            addListener(listener);
          }
        });
      };
      async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        if (typeof times === "function") {
          callback = task;
          task = times;
          times = DEFAULT_TIMES;
        }
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
          var retryAttempt = function(task2, finalAttempt) {
            return function(seriesCallback) {
              task2(function(err, result) {
                seriesCallback(!err || finalAttempt, { err, result });
              }, wrappedResults);
            };
          };
          while (times) {
            attempts.push(retryAttempt(task, !(times -= 1)));
          }
          async.series(attempts, function(done, data) {
            data = data[data.length - 1];
            (wrappedCallback || callback)(data.err, data.result);
          });
        };
        return callback ? wrappedTask() : wrappedTask;
      };
      async.waterfall = function(tasks, callback) {
        callback = callback || function() {
        };
        if (!_isArray(tasks)) {
          var err = new Error("First argument to waterfall must be an array of functions");
          return callback(err);
        }
        if (!tasks.length) {
          return callback();
        }
        var wrapIterator = function(iterator) {
          return function(err2) {
            if (err2) {
              callback.apply(null, arguments);
              callback = function() {
              };
            } else {
              var args = Array.prototype.slice.call(arguments, 1);
              var next = iterator.next();
              if (next) {
                args.push(wrapIterator(next));
              } else {
                args.push(callback);
              }
              async.setImmediate(function() {
                iterator.apply(null, args);
              });
            }
          };
        };
        wrapIterator(async.iterator(tasks))();
      };
      var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function() {
        };
        if (_isArray(tasks)) {
          eachfn.map(tasks, function(fn, callback2) {
            if (fn) {
              fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          eachfn.each(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async.parallel = function(tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
      };
      async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
      };
      async.series = function(tasks, callback) {
        callback = callback || function() {
        };
        if (_isArray(tasks)) {
          async.mapSeries(tasks, function(fn, callback2) {
            if (fn) {
              fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          async.eachSeries(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async.iterator = function(tasks) {
        var makeCallback = function(index) {
          var fn = function() {
            if (tasks.length) {
              tasks[index].apply(null, arguments);
            }
            return fn.next();
          };
          fn.next = function() {
            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
          };
          return fn;
        };
        return makeCallback(0);
      };
      async.apply = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
          return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
        };
      };
      var _concat = function(eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function(x, cb) {
          fn(x, function(err, y) {
            r = r.concat(y || []);
            cb(err);
          });
        }, function(err) {
          callback(err, r);
        });
      };
      async.concat = doParallel(_concat);
      async.concatSeries = doSeries(_concat);
      async.whilst = function(test, iterator, callback) {
        if (test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async.whilst(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async.doWhilst = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          var args = Array.prototype.slice.call(arguments, 1);
          if (test.apply(null, args)) {
            async.doWhilst(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async.until = function(test, iterator, callback) {
        if (!test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async.until(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async.doUntil = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          var args = Array.prototype.slice.call(arguments, 1);
          if (!test.apply(null, args)) {
            async.doUntil(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async.queue = function(worker, concurrency) {
        if (concurrency === void 0) {
          concurrency = 1;
        }
        function _insert(q2, data, pos, callback) {
          if (!q2.started) {
            q2.started = true;
          }
          if (!_isArray(data)) {
            data = [data];
          }
          if (data.length == 0) {
            return async.setImmediate(function() {
              if (q2.drain) {
                q2.drain();
              }
            });
          }
          _each(data, function(task) {
            var item = {
              data: task,
              callback: typeof callback === "function" ? callback : null
            };
            if (pos) {
              q2.tasks.unshift(item);
            } else {
              q2.tasks.push(item);
            }
            if (q2.saturated && q2.tasks.length === q2.concurrency) {
              q2.saturated();
            }
            async.setImmediate(q2.process);
          });
        }
        var workers = 0;
        var q = {
          tasks: [],
          concurrency,
          saturated: null,
          empty: null,
          drain: null,
          started: false,
          paused: false,
          push: function(data, callback) {
            _insert(q, data, false, callback);
          },
          kill: function() {
            q.drain = null;
            q.tasks = [];
          },
          unshift: function(data, callback) {
            _insert(q, data, true, callback);
          },
          process: function() {
            if (!q.paused && workers < q.concurrency && q.tasks.length) {
              var task = q.tasks.shift();
              if (q.empty && q.tasks.length === 0) {
                q.empty();
              }
              workers += 1;
              var next = function() {
                workers -= 1;
                if (task.callback) {
                  task.callback.apply(task, arguments);
                }
                if (q.drain && q.tasks.length + workers === 0) {
                  q.drain();
                }
                q.process();
              };
              var cb = only_once(next);
              worker(task.data, cb);
            }
          },
          length: function() {
            return q.tasks.length;
          },
          running: function() {
            return workers;
          },
          idle: function() {
            return q.tasks.length + workers === 0;
          },
          pause: function() {
            if (q.paused === true) {
              return;
            }
            q.paused = true;
          },
          resume: function() {
            if (q.paused === false) {
              return;
            }
            q.paused = false;
            for (var w = 1; w <= q.concurrency; w++) {
              async.setImmediate(q.process);
            }
          }
        };
        return q;
      };
      async.priorityQueue = function(worker, concurrency) {
        function _compareTasks(a, b) {
          return a.priority - b.priority;
        }
        ;
        function _binarySearch(sequence, item, compare) {
          var beg = -1, end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + (end - beg + 1 >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }
        function _insert(q2, data, priority, callback) {
          if (!q2.started) {
            q2.started = true;
          }
          if (!_isArray(data)) {
            data = [data];
          }
          if (data.length == 0) {
            return async.setImmediate(function() {
              if (q2.drain) {
                q2.drain();
              }
            });
          }
          _each(data, function(task) {
            var item = {
              data: task,
              priority,
              callback: typeof callback === "function" ? callback : null
            };
            q2.tasks.splice(_binarySearch(q2.tasks, item, _compareTasks) + 1, 0, item);
            if (q2.saturated && q2.tasks.length === q2.concurrency) {
              q2.saturated();
            }
            async.setImmediate(q2.process);
          });
        }
        var q = async.queue(worker, concurrency);
        q.push = function(data, priority, callback) {
          _insert(q, data, priority, callback);
        };
        delete q.unshift;
        return q;
      };
      async.cargo = function(worker, payload) {
        var working = false, tasks = [];
        var cargo = {
          tasks,
          payload,
          saturated: null,
          empty: null,
          drain: null,
          drained: true,
          push: function(data, callback) {
            if (!_isArray(data)) {
              data = [data];
            }
            _each(data, function(task) {
              tasks.push({
                data: task,
                callback: typeof callback === "function" ? callback : null
              });
              cargo.drained = false;
              if (cargo.saturated && tasks.length === payload) {
                cargo.saturated();
              }
            });
            async.setImmediate(cargo.process);
          },
          process: function process2() {
            if (working)
              return;
            if (tasks.length === 0) {
              if (cargo.drain && !cargo.drained)
                cargo.drain();
              cargo.drained = true;
              return;
            }
            var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0, tasks.length);
            var ds = _map(ts, function(task) {
              return task.data;
            });
            if (cargo.empty)
              cargo.empty();
            working = true;
            worker(ds, function() {
              working = false;
              var args = arguments;
              _each(ts, function(data) {
                if (data.callback) {
                  data.callback.apply(null, args);
                }
              });
              process2();
            });
          },
          length: function() {
            return tasks.length;
          },
          running: function() {
            return working;
          }
        };
        return cargo;
      };
      var _console_fn = function(name) {
        return function(fn) {
          var args = Array.prototype.slice.call(arguments, 1);
          fn.apply(null, args.concat([function(err) {
            var args2 = Array.prototype.slice.call(arguments, 1);
            if (typeof console !== "undefined") {
              if (err) {
                if (console.error) {
                  console.error(err);
                }
              } else if (console[name]) {
                _each(args2, function(x) {
                  console[name](x);
                });
              }
            }
          }]));
        };
      };
      async.log = _console_fn("log");
      async.dir = _console_fn("dir");
      async.memoize = function(fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function(x) {
          return x;
        };
        var memoized = function() {
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          var key = hasher.apply(null, args);
          if (key in memo) {
            async.nextTick(function() {
              callback.apply(null, memo[key]);
            });
          } else if (key in queues) {
            queues[key].push(callback);
          } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([function() {
              memo[key] = arguments;
              var q = queues[key];
              delete queues[key];
              for (var i = 0, l = q.length; i < l; i++) {
                q[i].apply(null, arguments);
              }
            }]));
          }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
      };
      async.unmemoize = function(fn) {
        return function() {
          return (fn.unmemoized || fn).apply(null, arguments);
        };
      };
      async.times = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async.map(counter, iterator, callback);
      };
      async.timesSeries = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
      };
      async.seq = function() {
        var fns = arguments;
        return function() {
          var that = this;
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          async.reduce(fns, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat([function() {
              var err = arguments[0];
              var nextargs = Array.prototype.slice.call(arguments, 1);
              cb(err, nextargs);
            }]));
          }, function(err, results) {
            callback.apply(that, [err].concat(results));
          });
        };
      };
      async.compose = function() {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
      };
      var _applyEach = function(eachfn, fns) {
        var go = function() {
          var that = this;
          var args2 = Array.prototype.slice.call(arguments);
          var callback = args2.pop();
          return eachfn(fns, function(fn, cb) {
            fn.apply(that, args2.concat([cb]));
          }, callback);
        };
        if (arguments.length > 2) {
          var args = Array.prototype.slice.call(arguments, 2);
          return go.apply(this, args);
        } else {
          return go;
        }
      };
      async.applyEach = doParallel(_applyEach);
      async.applyEachSeries = doSeries(_applyEach);
      async.forever = function(fn, callback) {
        function next(err) {
          if (err) {
            if (callback) {
              return callback(err);
            }
            throw err;
          }
          fn(next);
        }
        next();
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = async;
      } else if (typeof define !== "undefined" && define.amd) {
        define([], function() {
          return async;
        });
      } else {
        root.async = async;
      }
    })();
  }
});

// lib/elements/group.js
var require_group = __commonJS({
  "lib/elements/group.js"(exports, module) {
    var Utils = require_rtf_utils();
    var Element = require_element();
    var async = require_async();
    var GroupElement;
    module.exports = GroupElement = function(name, format) {
      Element.apply(this, [format]);
      this.elements = [];
      this.name = name;
    };
    GroupElement.subclass(Element);
    GroupElement.prototype.addElement = function(element) {
      this.elements.push(element);
    };
    GroupElement.prototype.getRTFCode = function(colorTable, fontTable, callback) {
      var tasks = [];
      var rtf = "";
      this.elements.forEach(function(el) {
        if (el instanceof Element) {
          tasks.push(function(cb) {
            el.getRTFCode(colorTable, fontTable, cb);
          });
        } else {
          tasks.push(function(cb) {
            cb(null, Utils.getRTFSafeText(el));
          });
        }
      });
      return async.parallel(tasks, function(err, results) {
        results.forEach(function(result) {
          rtf += result;
        });
        rtf = this.format.formatText(rtf, colorTable, fontTable, false);
        return callback(null, rtf);
      });
    };
  }
});

// lib/rtf.js
var require_rtf = __commonJS({
  "lib/rtf.js"(exports, module) {
    var Element = require_element();
    var Utils = require_rtf_utils();
    var Language = require_language();
    var Orientation = require_orientation();
    var TextElement = require_text();
    var LinkElement = require_link();
    var GroupElement = require_group();
    var async = require_async();
    var RTF;
    module.exports = RTF = function() {
      this.pageNumbering = false;
      this.marginLeft = 1800;
      this.marginRight = 1800;
      this.marginBottom = 1440;
      this.marginTop = 1440;
      this.language = Language.ENG_US;
      this.columns = 0;
      this.columnLines = false;
      this.orientation = Orientation.PORTRAIT;
      this.elements = [];
      this.colorTable = [];
      this.fontTable = [];
    };
    RTF.prototype.writeText = function(text, format, groupName) {
      const element = new TextElement(text, format);
      if (groupName !== void 0 && this._groupIndex(groupName) >= 0) {
        this.elements[this._groupIndex(groupName)].push(element);
      } else {
        this.elements.push(element);
      }
    };
    RTF.prototype.writeLink = function(text, url, format, groupName) {
      const element = new LinkElement(text, url, format);
      if (groupName !== void 0 && this._groupIndex(groupName) >= 0) {
        this.elements[this._groupIndex(groupName)].push(element);
      } else {
        this.elements.push(element);
      }
    };
    RTF.prototype.addTable = function(table) {
      this.elements.push(table);
    };
    RTF.prototype.addTextGroup = function(name, format) {
      if (this._groupIndex(name) < 0) {
        const formatGroup = new GroupElement(name, format);
        this.elements.push(formatGroup);
      }
    };
    RTF.prototype.addCommand = function(command, groupName) {
      if (groupName !== void 0 && this._groupIndex(groupName) >= 0) {
        this.elements[this._groupIndex(groupName)].addElement({
          text: command,
          safe: false
        });
      } else {
        this.elements.push({ text: command, safe: false });
      }
    };
    RTF.prototype.addPage = function(groupName) {
      this.addCommand("\\page", groupName);
    };
    RTF.prototype.addLine = function(groupName) {
      this.addCommand("\\line", groupName);
    };
    RTF.prototype.startList = function(groupName) {
      this.addCommand("\\pard\\ls1\\ilvl0", groupName);
    };
    RTF.prototype.addTab = function(groupName) {
      this.addCommand("\\tab", groupName);
    };
    RTF.prototype._groupIndex = function(name) {
      this.elements.forEach(function(el, i) {
        if (el instanceof GroupElement && el.name === name) {
          return i;
        }
      });
      return -1;
    };
    RTF.prototype.createDocument = function(callback) {
      var output = "{\\rtf1\\ansi\\deff0";
      if (this.orientation == Orientation.LANDSCAPE)
        output += "\\landscape";
      if (this.marginLeft > 0)
        output += "\\margl" + this.marginLeft;
      if (this.marginRight > 0)
        output += "\\margr" + this.marginRight;
      if (this.marginTop > 0)
        output += "\\margt" + this.marginTop;
      if (this.marginBottom > 0)
        output += "\\margb" + this.marginBottom;
      output += "\\deflang" + this.language;
      var tasks = [];
      var ct = this.colorTable;
      var ft = this.fontTable;
      this.elements.forEach(function(el) {
        if (el instanceof Element) {
          tasks.push(function(cb) {
            el.getRTFCode(ct, ft, cb);
          });
        } else {
          tasks.push(function(cb) {
            cb(null, Utils.getRTFSafeText(el));
          });
        }
      });
      return async.parallel(tasks, function(err, results) {
        var elementOutput = "";
        results.forEach(function(result) {
          elementOutput += result;
        });
        output += Utils.createColorTable(ct);
        output += Utils.createFontTable(ft);
        if (this.pageNumbering)
          output += "{\\header\\pard\\qr\\plain\\f0\\chpgn\\par}";
        if (this.columns > 0)
          output += "\\cols" + this.columns;
        if (this.columnLines)
          output += "\\linebetcol";
        output += elementOutput + "}";
        return callback(null, output);
      });
    };
  }
});
export default require_rtf();
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
