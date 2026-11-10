// ProxyGosha v1.3.0 — built artifact (esbuild). Source: src/ · Telegram WEB proxy for Cloudflare Workers.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/qrcode-generator/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode-generator/qrcode.js"(exports, module) {
    var qrcode2 = function() {
      var qrcode3 = /* @__PURE__ */ __name(function(typeNumber, errorCorrectionLevel) {
        var PAD0 = 236;
        var PAD1 = 17;
        var _typeNumber = typeNumber;
        var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
        var _modules = null;
        var _moduleCount = 0;
        var _dataCache = null;
        var _dataList = [];
        var _this = {};
        var makeImpl = /* @__PURE__ */ __name(function(test, maskPattern) {
          _moduleCount = _typeNumber * 4 + 17;
          _modules = function(moduleCount) {
            var modules = new Array(moduleCount);
            for (var row = 0; row < moduleCount; row += 1) {
              modules[row] = new Array(moduleCount);
              for (var col = 0; col < moduleCount; col += 1) {
                modules[row][col] = null;
              }
            }
            return modules;
          }(_moduleCount);
          setupPositionProbePattern(0, 0);
          setupPositionProbePattern(_moduleCount - 7, 0);
          setupPositionProbePattern(0, _moduleCount - 7);
          setupPositionAdjustPattern();
          setupTimingPattern();
          setupTypeInfo(test, maskPattern);
          if (_typeNumber >= 7) {
            setupTypeNumber(test);
          }
          if (_dataCache == null) {
            _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
          }
          mapData(_dataCache, maskPattern);
        }, "makeImpl");
        var setupPositionProbePattern = /* @__PURE__ */ __name(function(row, col) {
          for (var r = -1; r <= 7; r += 1) {
            if (row + r <= -1 || _moduleCount <= row + r) continue;
            for (var c = -1; c <= 7; c += 1) {
              if (col + c <= -1 || _moduleCount <= col + c) continue;
              if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }, "setupPositionProbePattern");
        var getBestMaskPattern = /* @__PURE__ */ __name(function() {
          var minLostPoint = 0;
          var pattern = 0;
          for (var i = 0; i < 8; i += 1) {
            makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(_this);
            if (i == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i;
            }
          }
          return pattern;
        }, "getBestMaskPattern");
        var setupTimingPattern = /* @__PURE__ */ __name(function() {
          for (var r = 8; r < _moduleCount - 8; r += 1) {
            if (_modules[r][6] != null) {
              continue;
            }
            _modules[r][6] = r % 2 == 0;
          }
          for (var c = 8; c < _moduleCount - 8; c += 1) {
            if (_modules[6][c] != null) {
              continue;
            }
            _modules[6][c] = c % 2 == 0;
          }
        }, "setupTimingPattern");
        var setupPositionAdjustPattern = /* @__PURE__ */ __name(function() {
          var pos = QRUtil.getPatternPosition(_typeNumber);
          for (var i = 0; i < pos.length; i += 1) {
            for (var j = 0; j < pos.length; j += 1) {
              var row = pos[i];
              var col = pos[j];
              if (_modules[row][col] != null) {
                continue;
              }
              for (var r = -2; r <= 2; r += 1) {
                for (var c = -2; c <= 2; c += 1) {
                  if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                    _modules[row + r][col + c] = true;
                  } else {
                    _modules[row + r][col + c] = false;
                  }
                }
              }
            }
          }
        }, "setupPositionAdjustPattern");
        var setupTypeNumber = /* @__PURE__ */ __name(function(test) {
          var bits = QRUtil.getBCHTypeNumber(_typeNumber);
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
          }
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
          }
        }, "setupTypeNumber");
        var setupTypeInfo = /* @__PURE__ */ __name(function(test, maskPattern) {
          var data = _errorCorrectionLevel << 3 | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 6) {
              _modules[i][8] = mod;
            } else if (i < 8) {
              _modules[i + 1][8] = mod;
            } else {
              _modules[_moduleCount - 15 + i][8] = mod;
            }
          }
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 8) {
              _modules[8][_moduleCount - i - 1] = mod;
            } else if (i < 9) {
              _modules[8][15 - i - 1 + 1] = mod;
            } else {
              _modules[8][15 - i - 1] = mod;
            }
          }
          _modules[_moduleCount - 8][8] = !test;
        }, "setupTypeInfo");
        var mapData = /* @__PURE__ */ __name(function(data, maskPattern) {
          var inc = -1;
          var row = _moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          var maskFunc = QRUtil.getMaskFunction(maskPattern);
          for (var col = _moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col -= 1;
            while (true) {
              for (var c = 0; c < 2; c += 1) {
                if (_modules[row][col - c] == null) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                  }
                  var mask = maskFunc(row, col - c);
                  if (mask) {
                    dark = !dark;
                  }
                  _modules[row][col - c] = dark;
                  bitIndex -= 1;
                  if (bitIndex == -1) {
                    byteIndex += 1;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || _moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        }, "mapData");
        var createBytes = /* @__PURE__ */ __name(function(buffer, rsBlocks) {
          var offset = 0;
          var maxDcCount = 0;
          var maxEcCount = 0;
          var dcdata = new Array(rsBlocks.length);
          var ecdata = new Array(rsBlocks.length);
          for (var r = 0; r < rsBlocks.length; r += 1) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i += 1) {
              dcdata[r][i] = 255 & buffer.getBuffer()[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i += 1) {
              var modIndex = i + modPoly.getLength() - ecdata[r].length;
              ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
          }
          var totalCodeCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalCodeCount += rsBlocks[i].totalCount;
          }
          var data = new Array(totalCodeCount);
          var index = 0;
          for (var i = 0; i < maxDcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < dcdata[r].length) {
                data[index] = dcdata[r][i];
                index += 1;
              }
            }
          }
          for (var i = 0; i < maxEcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < ecdata[r].length) {
                data[index] = ecdata[r][i];
                index += 1;
              }
            }
          }
          return data;
        }, "createBytes");
        var createData = /* @__PURE__ */ __name(function(typeNumber2, errorCorrectionLevel2, dataList) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, errorCorrectionLevel2);
          var buffer = qrBitBuffer();
          for (var i = 0; i < dataList.length; i += 1) {
            var data = dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
            data.write(buffer);
          }
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalDataCount += rsBlocks[i].dataCount;
          }
          if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
          }
          if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
          }
          while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
          }
          while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD1, 8);
          }
          return createBytes(buffer, rsBlocks);
        }, "createData");
        _this.addData = function(data, mode) {
          mode = mode || "Byte";
          var newData = null;
          switch (mode) {
            case "Numeric":
              newData = qrNumber(data);
              break;
            case "Alphanumeric":
              newData = qrAlphaNum(data);
              break;
            case "Byte":
              newData = qr8BitByte(data);
              break;
            case "Kanji":
              newData = qrKanji(data);
              break;
            default:
              throw "mode:" + mode;
          }
          _dataList.push(newData);
          _dataCache = null;
        };
        _this.isDark = function(row, col) {
          if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
            throw row + "," + col;
          }
          return _modules[row][col];
        };
        _this.getModuleCount = function() {
          return _moduleCount;
        };
        _this.make = function() {
          if (_typeNumber < 1) {
            var typeNumber2 = 1;
            for (; typeNumber2 < 40; typeNumber2++) {
              var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, _errorCorrectionLevel);
              var buffer = qrBitBuffer();
              for (var i = 0; i < _dataList.length; i++) {
                var data = _dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
                data.write(buffer);
              }
              var totalDataCount = 0;
              for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
              }
              if (buffer.getLengthInBits() <= totalDataCount * 8) {
                break;
              }
            }
            _typeNumber = typeNumber2;
          }
          makeImpl(false, getBestMaskPattern());
        };
        _this.createTableTag = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var qrHtml = "";
          qrHtml += '<table style="';
          qrHtml += " border-width: 0px; border-style: none;";
          qrHtml += " border-collapse: collapse;";
          qrHtml += " padding: 0px; margin: " + margin + "px;";
          qrHtml += '">';
          qrHtml += "<tbody>";
          for (var r = 0; r < _this.getModuleCount(); r += 1) {
            qrHtml += "<tr>";
            for (var c = 0; c < _this.getModuleCount(); c += 1) {
              qrHtml += '<td style="';
              qrHtml += " border-width: 0px; border-style: none;";
              qrHtml += " border-collapse: collapse;";
              qrHtml += " padding: 0px; margin: 0px;";
              qrHtml += " width: " + cellSize + "px;";
              qrHtml += " height: " + cellSize + "px;";
              qrHtml += " background-color: ";
              qrHtml += _this.isDark(r, c) ? "#000000" : "#ffffff";
              qrHtml += ";";
              qrHtml += '"/>';
            }
            qrHtml += "</tr>";
          }
          qrHtml += "</tbody>";
          qrHtml += "</table>";
          return qrHtml;
        };
        _this.createSvgTag = function(cellSize, margin, alt, title) {
          var opts = {};
          if (typeof arguments[0] == "object") {
            opts = arguments[0];
            cellSize = opts.cellSize;
            margin = opts.margin;
            alt = opts.alt;
            title = opts.title;
          }
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          alt = typeof alt === "string" ? { text: alt } : alt || {};
          alt.text = alt.text || null;
          alt.id = alt.text ? alt.id || "qrcode-description" : null;
          title = typeof title === "string" ? { text: title } : title || {};
          title.text = title.text || null;
          title.id = title.text ? title.id || "qrcode-title" : null;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var c, mc, r, mr, qrSvg2 = "", rect;
          rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
          qrSvg2 += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
          qrSvg2 += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
          qrSvg2 += ' viewBox="0 0 ' + size + " " + size + '" ';
          qrSvg2 += ' preserveAspectRatio="xMinYMin meet"';
          qrSvg2 += title.text || alt.text ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"' : "";
          qrSvg2 += ">";
          qrSvg2 += title.text ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + "</title>" : "";
          qrSvg2 += alt.text ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + "</description>" : "";
          qrSvg2 += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
          qrSvg2 += '<path d="';
          for (r = 0; r < _this.getModuleCount(); r += 1) {
            mr = r * cellSize + margin;
            for (c = 0; c < _this.getModuleCount(); c += 1) {
              if (_this.isDark(r, c)) {
                mc = c * cellSize + margin;
                qrSvg2 += "M" + mc + "," + mr + rect;
              }
            }
          }
          qrSvg2 += '" stroke="transparent" fill="black"/>';
          qrSvg2 += "</svg>";
          return qrSvg2;
        };
        _this.createDataURL = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          return createDataURL(size, size, function(x, y) {
            if (min <= x && x < max && min <= y && y < max) {
              var c = Math.floor((x - min) / cellSize);
              var r = Math.floor((y - min) / cellSize);
              return _this.isDark(r, c) ? 0 : 1;
            } else {
              return 1;
            }
          });
        };
        _this.createImgTag = function(cellSize, margin, alt) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var img = "";
          img += "<img";
          img += ' src="';
          img += _this.createDataURL(cellSize, margin);
          img += '"';
          img += ' width="';
          img += size;
          img += '"';
          img += ' height="';
          img += size;
          img += '"';
          if (alt) {
            img += ' alt="';
            img += escapeXml(alt);
            img += '"';
          }
          img += "/>";
          return img;
        };
        var escapeXml = /* @__PURE__ */ __name(function(s) {
          var escaped = "";
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charAt(i);
            switch (c) {
              case "<":
                escaped += "&lt;";
                break;
              case ">":
                escaped += "&gt;";
                break;
              case "&":
                escaped += "&amp;";
                break;
              case '"':
                escaped += "&quot;";
                break;
              default:
                escaped += c;
                break;
            }
          }
          return escaped;
        }, "escapeXml");
        var _createHalfASCII = /* @__PURE__ */ __name(function(margin) {
          var cellSize = 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r1, r2, p;
          var blocks = {
            "\u2588\u2588": "\u2588",
            "\u2588 ": "\u2580",
            " \u2588": "\u2584",
            "  ": " "
          };
          var blocksLastLineNoMargin = {
            "\u2588\u2588": "\u2580",
            "\u2588 ": "\u2580",
            " \u2588": " ",
            "  ": " "
          };
          var ascii = "";
          for (y = 0; y < size; y += 2) {
            r1 = Math.floor((y - min) / cellSize);
            r2 = Math.floor((y + 1 - min) / cellSize);
            for (x = 0; x < size; x += 1) {
              p = "\u2588";
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
                p = " ";
              }
              if (min <= x && x < max && min <= y + 1 && y + 1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
                p += " ";
              } else {
                p += "\u2588";
              }
              ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
            }
            ascii += "\n";
          }
          if (size % 2 && margin > 0) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("\u2580");
          }
          return ascii.substring(0, ascii.length - 1);
        }, "_createHalfASCII");
        _this.createASCII = function(cellSize, margin) {
          cellSize = cellSize || 1;
          if (cellSize < 2) {
            return _createHalfASCII(margin);
          }
          cellSize -= 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r, p;
          var white = Array(cellSize + 1).join("\u2588\u2588");
          var black = Array(cellSize + 1).join("  ");
          var ascii = "";
          var line = "";
          for (y = 0; y < size; y += 1) {
            r = Math.floor((y - min) / cellSize);
            line = "";
            for (x = 0; x < size; x += 1) {
              p = 1;
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
                p = 0;
              }
              line += p ? white : black;
            }
            for (r = 0; r < cellSize; r += 1) {
              ascii += line + "\n";
            }
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.renderTo2dContext = function(context, cellSize) {
          cellSize = cellSize || 2;
          var length = _this.getModuleCount();
          for (var row = 0; row < length; row++) {
            for (var col = 0; col < length; col++) {
              context.fillStyle = _this.isDark(row, col) ? "black" : "white";
              context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
          }
        };
        return _this;
      }, "qrcode");
      qrcode3.stringToBytesFuncs = {
        "default": /* @__PURE__ */ __name(function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            bytes.push(c & 255);
          }
          return bytes;
        }, "default")
      };
      qrcode3.stringToBytes = qrcode3.stringToBytesFuncs["default"];
      qrcode3.createStringToBytes = function(unicodeData, numChars) {
        var unicodeMap = function() {
          var bin = base64DecodeInputStream(unicodeData);
          var read = /* @__PURE__ */ __name(function() {
            var b = bin.read();
            if (b == -1) throw "eof";
            return b;
          }, "read");
          var count = 0;
          var unicodeMap2 = {};
          while (true) {
            var b0 = bin.read();
            if (b0 == -1) break;
            var b1 = read();
            var b2 = read();
            var b3 = read();
            var k = String.fromCharCode(b0 << 8 | b1);
            var v = b2 << 8 | b3;
            unicodeMap2[k] = v;
            count += 1;
          }
          if (count != numChars) {
            throw count + " != " + numChars;
          }
          return unicodeMap2;
        }();
        var unknownChar = "?".charCodeAt(0);
        return function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            if (c < 128) {
              bytes.push(c);
            } else {
              var b = unicodeMap[s.charAt(i)];
              if (typeof b == "number") {
                if ((b & 255) == b) {
                  bytes.push(b);
                } else {
                  bytes.push(b >>> 8);
                  bytes.push(b & 255);
                }
              } else {
                bytes.push(unknownChar);
              }
            }
          }
          return bytes;
        };
      };
      var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
      };
      var QRErrorCorrectionLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
      };
      var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var QRUtil = function() {
        var PATTERN_POSITION_TABLE = [
          [],
          [6, 18],
          [6, 22],
          [6, 26],
          [6, 30],
          [6, 34],
          [6, 22, 38],
          [6, 24, 42],
          [6, 26, 46],
          [6, 28, 50],
          [6, 30, 54],
          [6, 32, 58],
          [6, 34, 62],
          [6, 26, 46, 66],
          [6, 26, 48, 70],
          [6, 26, 50, 74],
          [6, 30, 54, 78],
          [6, 30, 56, 82],
          [6, 30, 58, 86],
          [6, 34, 62, 90],
          [6, 28, 50, 72, 94],
          [6, 26, 50, 74, 98],
          [6, 30, 54, 78, 102],
          [6, 28, 54, 80, 106],
          [6, 32, 58, 84, 110],
          [6, 30, 58, 86, 114],
          [6, 34, 62, 90, 118],
          [6, 26, 50, 74, 98, 122],
          [6, 30, 54, 78, 102, 126],
          [6, 26, 52, 78, 104, 130],
          [6, 30, 56, 82, 108, 134],
          [6, 34, 60, 86, 112, 138],
          [6, 30, 58, 86, 114, 142],
          [6, 34, 62, 90, 118, 146],
          [6, 30, 54, 78, 102, 126, 150],
          [6, 24, 50, 76, 102, 128, 154],
          [6, 28, 54, 80, 106, 132, 158],
          [6, 32, 58, 84, 110, 136, 162],
          [6, 26, 54, 82, 110, 138, 166],
          [6, 30, 58, 86, 114, 142, 170]
        ];
        var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
        var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
        var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
        var _this = {};
        var getBCHDigit = /* @__PURE__ */ __name(function(data) {
          var digit = 0;
          while (data != 0) {
            digit += 1;
            data >>>= 1;
          }
          return digit;
        }, "getBCHDigit");
        _this.getBCHTypeInfo = function(data) {
          var d = data << 10;
          while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
          }
          return (data << 10 | d) ^ G15_MASK;
        };
        _this.getBCHTypeNumber = function(data) {
          var d = data << 12;
          while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
          }
          return data << 12 | d;
        };
        _this.getPatternPosition = function(typeNumber) {
          return PATTERN_POSITION_TABLE[typeNumber - 1];
        };
        _this.getMaskFunction = function(maskPattern) {
          switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
              return function(i, j) {
                return (i + j) % 2 == 0;
              };
            case QRMaskPattern.PATTERN001:
              return function(i, j) {
                return i % 2 == 0;
              };
            case QRMaskPattern.PATTERN010:
              return function(i, j) {
                return j % 3 == 0;
              };
            case QRMaskPattern.PATTERN011:
              return function(i, j) {
                return (i + j) % 3 == 0;
              };
            case QRMaskPattern.PATTERN100:
              return function(i, j) {
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
              };
            case QRMaskPattern.PATTERN101:
              return function(i, j) {
                return i * j % 2 + i * j % 3 == 0;
              };
            case QRMaskPattern.PATTERN110:
              return function(i, j) {
                return (i * j % 2 + i * j % 3) % 2 == 0;
              };
            case QRMaskPattern.PATTERN111:
              return function(i, j) {
                return (i * j % 3 + (i + j) % 2) % 2 == 0;
              };
            default:
              throw "bad maskPattern:" + maskPattern;
          }
        };
        _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
          var a = qrPolynomial([1], 0);
          for (var i = 0; i < errorCorrectLength; i += 1) {
            a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
          }
          return a;
        };
        _this.getLengthInBits = function(mode, type) {
          if (1 <= type && type < 10) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 10;
              case QRMode.MODE_ALPHA_NUM:
                return 9;
              case QRMode.MODE_8BIT_BYTE:
                return 8;
              case QRMode.MODE_KANJI:
                return 8;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 27) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 12;
              case QRMode.MODE_ALPHA_NUM:
                return 11;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 10;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 41) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 14;
              case QRMode.MODE_ALPHA_NUM:
                return 13;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 12;
              default:
                throw "mode:" + mode;
            }
          } else {
            throw "type:" + type;
          }
        };
        _this.getLostPoint = function(qrcode4) {
          var moduleCount = qrcode4.getModuleCount();
          var lostPoint = 0;
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount; col += 1) {
              var sameCount = 0;
              var dark = qrcode4.isDark(row, col);
              for (var r = -1; r <= 1; r += 1) {
                if (row + r < 0 || moduleCount <= row + r) {
                  continue;
                }
                for (var c = -1; c <= 1; c += 1) {
                  if (col + c < 0 || moduleCount <= col + c) {
                    continue;
                  }
                  if (r == 0 && c == 0) {
                    continue;
                  }
                  if (dark == qrcode4.isDark(row + r, col + c)) {
                    sameCount += 1;
                  }
                }
              }
              if (sameCount > 5) {
                lostPoint += 3 + sameCount - 5;
              }
            }
          }
          ;
          for (var row = 0; row < moduleCount - 1; row += 1) {
            for (var col = 0; col < moduleCount - 1; col += 1) {
              var count = 0;
              if (qrcode4.isDark(row, col)) count += 1;
              if (qrcode4.isDark(row + 1, col)) count += 1;
              if (qrcode4.isDark(row, col + 1)) count += 1;
              if (qrcode4.isDark(row + 1, col + 1)) count += 1;
              if (count == 0 || count == 4) {
                lostPoint += 3;
              }
            }
          }
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount - 6; col += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row, col + 1) && qrcode4.isDark(row, col + 2) && qrcode4.isDark(row, col + 3) && qrcode4.isDark(row, col + 4) && !qrcode4.isDark(row, col + 5) && qrcode4.isDark(row, col + 6)) {
                lostPoint += 40;
              }
            }
          }
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount - 6; row += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row + 1, col) && qrcode4.isDark(row + 2, col) && qrcode4.isDark(row + 3, col) && qrcode4.isDark(row + 4, col) && !qrcode4.isDark(row + 5, col) && qrcode4.isDark(row + 6, col)) {
                lostPoint += 40;
              }
            }
          }
          var darkCount = 0;
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount; row += 1) {
              if (qrcode4.isDark(row, col)) {
                darkCount += 1;
              }
            }
          }
          var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
          lostPoint += ratio * 10;
          return lostPoint;
        };
        return _this;
      }();
      var QRMath = function() {
        var EXP_TABLE = new Array(256);
        var LOG_TABLE = new Array(256);
        for (var i = 0; i < 8; i += 1) {
          EXP_TABLE[i] = 1 << i;
        }
        for (var i = 8; i < 256; i += 1) {
          EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
        }
        for (var i = 0; i < 255; i += 1) {
          LOG_TABLE[EXP_TABLE[i]] = i;
        }
        var _this = {};
        _this.glog = function(n) {
          if (n < 1) {
            throw "glog(" + n + ")";
          }
          return LOG_TABLE[n];
        };
        _this.gexp = function(n) {
          while (n < 0) {
            n += 255;
          }
          while (n >= 256) {
            n -= 255;
          }
          return EXP_TABLE[n];
        };
        return _this;
      }();
      function qrPolynomial(num, shift) {
        if (typeof num.length == "undefined") {
          throw num.length + "/" + shift;
        }
        var _num = function() {
          var offset = 0;
          while (offset < num.length && num[offset] == 0) {
            offset += 1;
          }
          var _num2 = new Array(num.length - offset + shift);
          for (var i = 0; i < num.length - offset; i += 1) {
            _num2[i] = num[i + offset];
          }
          return _num2;
        }();
        var _this = {};
        _this.getAt = function(index) {
          return _num[index];
        };
        _this.getLength = function() {
          return _num.length;
        };
        _this.multiply = function(e) {
          var num2 = new Array(_this.getLength() + e.getLength() - 1);
          for (var i = 0; i < _this.getLength(); i += 1) {
            for (var j = 0; j < e.getLength(); j += 1) {
              num2[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
            }
          }
          return qrPolynomial(num2, 0);
        };
        _this.mod = function(e) {
          if (_this.getLength() - e.getLength() < 0) {
            return _this;
          }
          var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
          var num2 = new Array(_this.getLength());
          for (var i = 0; i < _this.getLength(); i += 1) {
            num2[i] = _this.getAt(i);
          }
          for (var i = 0; i < e.getLength(); i += 1) {
            num2[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
          }
          return qrPolynomial(num2, 0).mod(e);
        };
        return _this;
      }
      __name(qrPolynomial, "qrPolynomial");
      ;
      var QRRSBlock = function() {
        var RS_BLOCK_TABLE = [
          // L
          // M
          // Q
          // H
          // 1
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],
          // 2
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],
          // 3
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],
          // 4
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],
          // 5
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],
          // 6
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],
          // 7
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],
          // 8
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],
          // 9
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],
          // 10
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],
          // 11
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],
          // 12
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],
          // 13
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],
          // 14
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],
          // 15
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12, 7, 37, 13],
          // 16
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],
          // 17
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],
          // 18
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],
          // 19
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],
          // 20
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],
          // 21
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],
          // 22
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],
          // 23
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],
          // 24
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],
          // 25
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],
          // 26
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],
          // 27
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],
          // 28
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],
          // 29
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],
          // 30
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],
          // 31
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],
          // 32
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],
          // 33
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],
          // 34
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],
          // 35
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],
          // 36
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],
          // 37
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],
          // 38
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],
          // 39
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],
          // 40
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16]
        ];
        var qrRSBlock = /* @__PURE__ */ __name(function(totalCount, dataCount) {
          var _this2 = {};
          _this2.totalCount = totalCount;
          _this2.dataCount = dataCount;
          return _this2;
        }, "qrRSBlock");
        var _this = {};
        var getRsBlockTable = /* @__PURE__ */ __name(function(typeNumber, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case QRErrorCorrectionLevel.L:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectionLevel.M:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectionLevel.Q:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectionLevel.H:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
              return void 0;
          }
        }, "getRsBlockTable");
        _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
          var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
          if (typeof rsBlock == "undefined") {
            throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
          }
          var length = rsBlock.length / 3;
          var list = [];
          for (var i = 0; i < length; i += 1) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];
            for (var j = 0; j < count; j += 1) {
              list.push(qrRSBlock(totalCount, dataCount));
            }
          }
          return list;
        };
        return _this;
      }();
      var qrBitBuffer = /* @__PURE__ */ __name(function() {
        var _buffer = [];
        var _length = 0;
        var _this = {};
        _this.getBuffer = function() {
          return _buffer;
        };
        _this.getAt = function(index) {
          var bufIndex = Math.floor(index / 8);
          return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
        };
        _this.put = function(num, length) {
          for (var i = 0; i < length; i += 1) {
            _this.putBit((num >>> length - i - 1 & 1) == 1);
          }
        };
        _this.getLengthInBits = function() {
          return _length;
        };
        _this.putBit = function(bit) {
          var bufIndex = Math.floor(_length / 8);
          if (_buffer.length <= bufIndex) {
            _buffer.push(0);
          }
          if (bit) {
            _buffer[bufIndex] |= 128 >>> _length % 8;
          }
          _length += 1;
        };
        return _this;
      }, "qrBitBuffer");
      var qrNumber = /* @__PURE__ */ __name(function(data) {
        var _mode = QRMode.MODE_NUMBER;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var data2 = _data;
          var i = 0;
          while (i + 2 < data2.length) {
            buffer.put(strToNum(data2.substring(i, i + 3)), 10);
            i += 3;
          }
          if (i < data2.length) {
            if (data2.length - i == 1) {
              buffer.put(strToNum(data2.substring(i, i + 1)), 4);
            } else if (data2.length - i == 2) {
              buffer.put(strToNum(data2.substring(i, i + 2)), 7);
            }
          }
        };
        var strToNum = /* @__PURE__ */ __name(function(s) {
          var num = 0;
          for (var i = 0; i < s.length; i += 1) {
            num = num * 10 + chatToNum(s.charAt(i));
          }
          return num;
        }, "strToNum");
        var chatToNum = /* @__PURE__ */ __name(function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          }
          throw "illegal char :" + c;
        }, "chatToNum");
        return _this;
      }, "qrNumber");
      var qrAlphaNum = /* @__PURE__ */ __name(function(data) {
        var _mode = QRMode.MODE_ALPHA_NUM;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var s = _data;
          var i = 0;
          while (i + 1 < s.length) {
            buffer.put(
              getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)),
              11
            );
            i += 2;
          }
          if (i < s.length) {
            buffer.put(getCode(s.charAt(i)), 6);
          }
        };
        var getCode = /* @__PURE__ */ __name(function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          } else if ("A" <= c && c <= "Z") {
            return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
          } else {
            switch (c) {
              case " ":
                return 36;
              case "$":
                return 37;
              case "%":
                return 38;
              case "*":
                return 39;
              case "+":
                return 40;
              case "-":
                return 41;
              case ".":
                return 42;
              case "/":
                return 43;
              case ":":
                return 44;
              default:
                throw "illegal char :" + c;
            }
          }
        }, "getCode");
        return _this;
      }, "qrAlphaNum");
      var qr8BitByte = /* @__PURE__ */ __name(function(data) {
        var _mode = QRMode.MODE_8BIT_BYTE;
        var _data = data;
        var _bytes = qrcode3.stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _bytes.length;
        };
        _this.write = function(buffer) {
          for (var i = 0; i < _bytes.length; i += 1) {
            buffer.put(_bytes[i], 8);
          }
        };
        return _this;
      }, "qr8BitByte");
      var qrKanji = /* @__PURE__ */ __name(function(data) {
        var _mode = QRMode.MODE_KANJI;
        var _data = data;
        var stringToBytes = qrcode3.stringToBytesFuncs["SJIS"];
        if (!stringToBytes) {
          throw "sjis not supported.";
        }
        !function(c, code) {
          var test = stringToBytes(c);
          if (test.length != 2 || (test[0] << 8 | test[1]) != code) {
            throw "sjis not supported.";
          }
        }("\u53CB", 38726);
        var _bytes = stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return ~~(_bytes.length / 2);
        };
        _this.write = function(buffer) {
          var data2 = _bytes;
          var i = 0;
          while (i + 1 < data2.length) {
            var c = (255 & data2[i]) << 8 | 255 & data2[i + 1];
            if (33088 <= c && c <= 40956) {
              c -= 33088;
            } else if (57408 <= c && c <= 60351) {
              c -= 49472;
            } else {
              throw "illegal char at " + (i + 1) + "/" + c;
            }
            c = (c >>> 8 & 255) * 192 + (c & 255);
            buffer.put(c, 13);
            i += 2;
          }
          if (i < data2.length) {
            throw "illegal char at " + (i + 1);
          }
        };
        return _this;
      }, "qrKanji");
      var byteArrayOutputStream = /* @__PURE__ */ __name(function() {
        var _bytes = [];
        var _this = {};
        _this.writeByte = function(b) {
          _bytes.push(b & 255);
        };
        _this.writeShort = function(i) {
          _this.writeByte(i);
          _this.writeByte(i >>> 8);
        };
        _this.writeBytes = function(b, off, len) {
          off = off || 0;
          len = len || b.length;
          for (var i = 0; i < len; i += 1) {
            _this.writeByte(b[i + off]);
          }
        };
        _this.writeString = function(s) {
          for (var i = 0; i < s.length; i += 1) {
            _this.writeByte(s.charCodeAt(i));
          }
        };
        _this.toByteArray = function() {
          return _bytes;
        };
        _this.toString = function() {
          var s = "";
          s += "[";
          for (var i = 0; i < _bytes.length; i += 1) {
            if (i > 0) {
              s += ",";
            }
            s += _bytes[i];
          }
          s += "]";
          return s;
        };
        return _this;
      }, "byteArrayOutputStream");
      var base64EncodeOutputStream = /* @__PURE__ */ __name(function() {
        var _buffer = 0;
        var _buflen = 0;
        var _length = 0;
        var _base64 = "";
        var _this = {};
        var writeEncoded = /* @__PURE__ */ __name(function(b) {
          _base64 += String.fromCharCode(encode(b & 63));
        }, "writeEncoded");
        var encode = /* @__PURE__ */ __name(function(n) {
          if (n < 0) {
          } else if (n < 26) {
            return 65 + n;
          } else if (n < 52) {
            return 97 + (n - 26);
          } else if (n < 62) {
            return 48 + (n - 52);
          } else if (n == 62) {
            return 43;
          } else if (n == 63) {
            return 47;
          }
          throw "n:" + n;
        }, "encode");
        _this.writeByte = function(n) {
          _buffer = _buffer << 8 | n & 255;
          _buflen += 8;
          _length += 1;
          while (_buflen >= 6) {
            writeEncoded(_buffer >>> _buflen - 6);
            _buflen -= 6;
          }
        };
        _this.flush = function() {
          if (_buflen > 0) {
            writeEncoded(_buffer << 6 - _buflen);
            _buffer = 0;
            _buflen = 0;
          }
          if (_length % 3 != 0) {
            var padlen = 3 - _length % 3;
            for (var i = 0; i < padlen; i += 1) {
              _base64 += "=";
            }
          }
        };
        _this.toString = function() {
          return _base64;
        };
        return _this;
      }, "base64EncodeOutputStream");
      var base64DecodeInputStream = /* @__PURE__ */ __name(function(str) {
        var _str = str;
        var _pos = 0;
        var _buffer = 0;
        var _buflen = 0;
        var _this = {};
        _this.read = function() {
          while (_buflen < 8) {
            if (_pos >= _str.length) {
              if (_buflen == 0) {
                return -1;
              }
              throw "unexpected end of file./" + _buflen;
            }
            var c = _str.charAt(_pos);
            _pos += 1;
            if (c == "=") {
              _buflen = 0;
              return -1;
            } else if (c.match(/^\s$/)) {
              continue;
            }
            _buffer = _buffer << 6 | decode(c.charCodeAt(0));
            _buflen += 6;
          }
          var n = _buffer >>> _buflen - 8 & 255;
          _buflen -= 8;
          return n;
        };
        var decode = /* @__PURE__ */ __name(function(c) {
          if (65 <= c && c <= 90) {
            return c - 65;
          } else if (97 <= c && c <= 122) {
            return c - 97 + 26;
          } else if (48 <= c && c <= 57) {
            return c - 48 + 52;
          } else if (c == 43) {
            return 62;
          } else if (c == 47) {
            return 63;
          } else {
            throw "c:" + c;
          }
        }, "decode");
        return _this;
      }, "base64DecodeInputStream");
      var gifImage = /* @__PURE__ */ __name(function(width, height) {
        var _width = width;
        var _height = height;
        var _data = new Array(width * height);
        var _this = {};
        _this.setPixel = function(x, y, pixel) {
          _data[y * _width + x] = pixel;
        };
        _this.write = function(out) {
          out.writeString("GIF87a");
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(128);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(255);
          out.writeString(",");
          out.writeShort(0);
          out.writeShort(0);
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(0);
          var lzwMinCodeSize = 2;
          var raster = getLZWRaster(lzwMinCodeSize);
          out.writeByte(lzwMinCodeSize);
          var offset = 0;
          while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
          }
          out.writeByte(raster.length - offset);
          out.writeBytes(raster, offset, raster.length - offset);
          out.writeByte(0);
          out.writeString(";");
        };
        var bitOutputStream = /* @__PURE__ */ __name(function(out) {
          var _out = out;
          var _bitLength = 0;
          var _bitBuffer = 0;
          var _this2 = {};
          _this2.write = function(data, length) {
            if (data >>> length != 0) {
              throw "length over";
            }
            while (_bitLength + length >= 8) {
              _out.writeByte(255 & (data << _bitLength | _bitBuffer));
              length -= 8 - _bitLength;
              data >>>= 8 - _bitLength;
              _bitBuffer = 0;
              _bitLength = 0;
            }
            _bitBuffer = data << _bitLength | _bitBuffer;
            _bitLength = _bitLength + length;
          };
          _this2.flush = function() {
            if (_bitLength > 0) {
              _out.writeByte(_bitBuffer);
            }
          };
          return _this2;
        }, "bitOutputStream");
        var getLZWRaster = /* @__PURE__ */ __name(function(lzwMinCodeSize) {
          var clearCode = 1 << lzwMinCodeSize;
          var endCode = (1 << lzwMinCodeSize) + 1;
          var bitLength = lzwMinCodeSize + 1;
          var table = lzwTable();
          for (var i = 0; i < clearCode; i += 1) {
            table.add(String.fromCharCode(i));
          }
          table.add(String.fromCharCode(clearCode));
          table.add(String.fromCharCode(endCode));
          var byteOut = byteArrayOutputStream();
          var bitOut = bitOutputStream(byteOut);
          bitOut.write(clearCode, bitLength);
          var dataIndex = 0;
          var s = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;
          while (dataIndex < _data.length) {
            var c = String.fromCharCode(_data[dataIndex]);
            dataIndex += 1;
            if (table.contains(s + c)) {
              s = s + c;
            } else {
              bitOut.write(table.indexOf(s), bitLength);
              if (table.size() < 4095) {
                if (table.size() == 1 << bitLength) {
                  bitLength += 1;
                }
                table.add(s + c);
              }
              s = c;
            }
          }
          bitOut.write(table.indexOf(s), bitLength);
          bitOut.write(endCode, bitLength);
          bitOut.flush();
          return byteOut.toByteArray();
        }, "getLZWRaster");
        var lzwTable = /* @__PURE__ */ __name(function() {
          var _map = {};
          var _size = 0;
          var _this2 = {};
          _this2.add = function(key) {
            if (_this2.contains(key)) {
              throw "dup key:" + key;
            }
            _map[key] = _size;
            _size += 1;
          };
          _this2.size = function() {
            return _size;
          };
          _this2.indexOf = function(key) {
            return _map[key];
          };
          _this2.contains = function(key) {
            return typeof _map[key] != "undefined";
          };
          return _this2;
        }, "lzwTable");
        return _this;
      }, "gifImage");
      var createDataURL = /* @__PURE__ */ __name(function(width, height, getPixel) {
        var gif = gifImage(width, height);
        for (var y = 0; y < height; y += 1) {
          for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y));
          }
        }
        var b = byteArrayOutputStream();
        gif.write(b);
        var base64 = base64EncodeOutputStream();
        var bytes = b.toByteArray();
        for (var i = 0; i < bytes.length; i += 1) {
          base64.writeByte(bytes[i]);
        }
        base64.flush();
        return "data:image/gif;base64," + base64;
      }, "createDataURL");
      return qrcode3;
    }();
    !function() {
      qrcode2.stringToBytesFuncs["UTF-8"] = function(s) {
        function toUTF8Array(str) {
          var utf8 = [];
          for (var i = 0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 128) utf8.push(charcode);
            else if (charcode < 2048) {
              utf8.push(
                192 | charcode >> 6,
                128 | charcode & 63
              );
            } else if (charcode < 55296 || charcode >= 57344) {
              utf8.push(
                224 | charcode >> 12,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            } else {
              i++;
              charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i) & 1023);
              utf8.push(
                240 | charcode >> 18,
                128 | charcode >> 12 & 63,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            }
          }
          return utf8;
        }
        __name(toUTF8Array, "toUTF8Array");
        return toUTF8Array(s);
      };
    }();
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define([], factory);
      } else if (typeof exports === "object") {
        module.exports = factory();
      }
    })(function() {
      return qrcode2;
    });
  }
});

// src/version.js
var VERSION = "1.3.0";
var CREDIT_NAME = "Amir Marandi";
var CREDIT_MAIL = "amirmarandidev@gmail.com";
var LEGACY_SEAL_B64 = "Pt54F2/pkjqM1YnQmZRs3Xvqd54U1iZVSYCfYAOgf5wIRzjyeruT";
var HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];
var PORT_MODE_BASE = 10;
var USER_MODE_BASE = 20;
var USER_MODE_LIMIT = 16;
var TOKEN_KIND_BOOTSTRAP = 1;
var TOKEN_KIND_SESSION = 2;
var REQUEST_LIMIT = 16777216;
var LEGACY_SESSION_PATH = "/api/v1/session";
var LEGACY_WS_PATH = "/api/v1/ws";
var TOKEN_DOMAIN = new TextEncoder().encode("tgweb-token-v1\0");
var KDF_DOMAIN = new TextEncoder().encode("proxygosha-kdf-v3\0");
var PERMISSIONS_POLICY = "accelerometer=(), autoplay=(), camera=(), clipboard-read=(self), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), usb=(), web-share=(), xr-spatial-tracking=()";

// src/config.js
var CONFIG = {
  hostnames: ["*"],
  debug: false,
  dc: {
    1: ["149.154.175.50", "149.154.175.53", "149.154.175.54"],
    2: ["149.154.167.51", "149.154.167.50", "149.154.167.40", "149.154.167.41"],
    3: ["149.154.175.100", "149.154.175.101"],
    4: ["149.154.167.91", "149.154.167.92", "149.154.167.90"],
    5: ["91.108.56.156", "91.108.56.165", "91.108.56.170"],
    203: ["91.105.192.110"]
  },
  dcPort: 443,
  dcPorts: [443, 80, 5222],
  carrier: "websocket-lanes",
  sessionPath: "",
  // empty => derived from secret (S2)
  wsPath: "",
  batchBytes: 2097152,
  // bridge -> carrier max batch (unchanged)
  upBatchBytes: 262144,
  // F1: 256 KiB DC-bound coalescing
  bootstrapTtl: 3600,
  // 1 hour
  sessionTtl: 21600,
  // S4: 6 hours (was 86400); bridge refreshes on reconnect
  maxStreams: 6,
  maxQueued: 16777216,
  maxIsolateQueued: 33554432,
  // F4: 32 MB isolate-wide guard
  streamWindow: 4194304,
  dataChunk: 65536
};
var KNOWN_ENV = [
  "ADMIN_KEY",
  "SECRET",
  "KEY_EPOCH",
  "EXTRA_HOSTS",
  "DECOY_URL",
  "CARRIER",
  "HOSTNAME",
  "MAX_STREAMS",
  "SESSION_PATH",
  "WS_PATH",
  "DEBUG",
  "UP_BATCH_BYTES",
  "DATA_CHUNK",
  "MAX_ISOLATE_QUEUED",
  "MAX_QUEUED",
  "SESSION_TTL",
  "DC_OVERRIDE",
  "USER_SECRETS",
  "LEGACY_PORT_SECRETS",
  "ALERT_URL",
  "BOOTSTRAP_TTL"
];
var COMMON_PATTERNS = ["password", "passwd", "123456", "qwerty", "admin", "letmein", "iloveyou", "proxygosha", "telegram", "aaaaaaaa"];
function adminKeyIssues(key) {
  const issues = [];
  if (!key) return issues;
  if (key.length < 16) {
    issues.push("too short (<16): rejected");
    return issues;
  }
  if (key.length < 24) issues.push("shorter than the recommended 24 characters");
  const classes = /[a-z]/.test(key) + /[A-Z]/.test(key) + /[0-9]/.test(key) + /[^A-Za-z0-9]/.test(key);
  if (classes < 2) issues.push("uses fewer than 2 character classes (dictionary-like)");
  if (new Set(key).size < Math.min(10, Math.ceil(key.length / 3))) issues.push("low character variety");
  const lower = key.toLowerCase();
  for (const p of COMMON_PATTERNS) if (lower.includes(p)) {
    issues.push(`contains a common pattern ("${p}")`);
    break;
  }
  if (/^(.)\1+$/.test(key) || /^(0123|1234|abcd|aaaa)/i.test(key)) issues.push("looks sequential");
  return issues;
}
__name(adminKeyIssues, "adminKeyIssues");
function resolveConfig(env) {
  const issues = [];
  const unknown = [];
  if (env && typeof env === "object") {
    for (const k of Object.keys(env)) {
      if (k.startsWith("CF_") || k.startsWith("__") || k === "nodejs_") continue;
      if (!KNOWN_ENV.includes(k)) unknown.push(k);
    }
  }
  const str = /* @__PURE__ */ __name((name) => typeof env?.[name] === "string" ? env[name] : "", "str");
  const num = /* @__PURE__ */ __name((name, def, min, max) => {
    const raw = str(name).trim();
    if (!raw) return def;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < min || n > max) {
      issues.push(`${name}: invalid value "${raw.slice(0, 24)}", using default ${def}`);
      return def;
    }
    return n;
  }, "num");
  const secretHex = str("SECRET").trim();
  const adminKey = str("ADMIN_KEY").trim();
  const keyEpoch = str("KEY_EPOCH").trim();
  const debug = env?.DEBUG === "true" || env?.DEBUG === "1";
  const decoyUrl = str("DECOY_URL").trim();
  const alertUrl = str("ALERT_URL").trim();
  if (alertUrl && !/^https:\/\//.test(alertUrl)) {
    issues.push("ALERT_URL: ignored, must be an https:// URL");
  }
  let hostnames = [];
  if (str("HOSTNAME").trim()) {
    hostnames = str("HOSTNAME").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  } else {
    hostnames = CONFIG.hostnames.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }
  const maxStreams = num("MAX_STREAMS", CONFIG.maxStreams, 1, 32);
  const bootstrapTtl = num("BOOTSTRAP_TTL", CONFIG.bootstrapTtl, 60, 86400);
  const sessionTtl = num("SESSION_TTL", CONFIG.sessionTtl, 600, 86400);
  if (str("SESSION_TTL").trim()) issues.push("SESSION_TTL: non-standard override in use");
  let sessionPath = "";
  let wsPath = "";
  const rawSession = str("SESSION_PATH").trim();
  const rawWs = str("WS_PATH").trim();
  if (rawSession) {
    sessionPath = rawSession.startsWith("/") ? rawSession : "/" + rawSession;
    if (!/^\/[A-Za-z0-9._~/-]{1,64}$/.test(sessionPath) || sessionPath.includes("..")) {
      issues.push("SESSION_PATH: invalid path, ignoring");
      sessionPath = "";
    }
  }
  if (rawWs) {
    wsPath = rawWs.startsWith("/") ? rawWs : "/" + rawWs;
    if (!/^\/[A-Za-z0-9._~/-]{1,64}$/.test(wsPath) || wsPath.includes("..")) {
      issues.push("WS_PATH: invalid path, ignoring");
      wsPath = "";
    }
  }
  const extraHosts = str("EXTRA_HOSTS").split(/[,\s]+/).map((value) => value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[:/].*$/, "").replace(/\.$/, "")).filter((value) => /^[a-z0-9.-]+$/.test(value) && !value.includes(".."));
  const carrierEnv = str("CARRIER").trim().toLowerCase();
  let carrier = CONFIG.carrier;
  if (carrierEnv === "websocket" || carrierEnv === "websocket-lanes" || carrierEnv === "auto") carrier = carrierEnv;
  else if (carrierEnv) issues.push(`CARRIER: unknown value "${carrierEnv.slice(0, 24)}", using default`);
  const upBatchBytes = num("UP_BATCH_BYTES", CONFIG.upBatchBytes, 16384, 1048576);
  const dataChunk = num("DATA_CHUNK", CONFIG.dataChunk, 16384, 262144);
  const maxQueued = num("MAX_QUEUED", CONFIG.maxQueued, 1048576, 67108864);
  const maxIsolateQueued = num("MAX_ISOLATE_QUEUED", CONFIG.maxIsolateQueued, 4194304, 134217728);
  let dcOverride = null;
  const rawOverride = str("DC_OVERRIDE").trim();
  if (rawOverride) {
    try {
      const parsed = JSON.parse(rawOverride);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("object expected");
      const clean = {};
      for (const [dcKey, ips] of Object.entries(parsed)) {
        const dcNum = parseInt(dcKey, 10);
        if (!Number.isInteger(dcNum) || dcNum < 1 || dcNum > 3e3) throw new Error(`bad DC id ${dcKey}`);
        const list = (Array.isArray(ips) ? ips : [ips]).map((s) => String(s).trim()).filter(Boolean);
        if (!list.length) throw new Error(`DC ${dcKey}: empty list`);
        for (const ip of list) {
          if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && !/^[0-9a-fA-F:]{2,45}$/.test(ip)) throw new Error(`DC ${dcKey}: bad address ${ip.slice(0, 20)}`);
        }
        clean[dcNum] = list;
      }
      if (!Object.keys(clean).length) throw new Error("empty object");
      dcOverride = clean;
    } catch (e) {
      issues.push(`DC_OVERRIDE: invalid (${String(e.message).slice(0, 60)}), using built-in DC list`);
    }
  }
  const userSecretsRaw = str("USER_SECRETS").trim();
  let userLabels = [];
  if (userSecretsRaw) {
    userLabels = userSecretsRaw.split(",").map((s) => s.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")).filter(Boolean).slice(0, USER_LABEL_MAX);
    if (!userLabels.length) issues.push("USER_SECRETS: set but no valid labels found (labels: a-z 0-9 _ -)");
    else if (new Set(userLabels).size !== userLabels.length) issues.push("USER_SECRETS: duplicate labels removed");
    userLabels = [...new Set(userLabels)];
  }
  const legacyPortSecrets = env?.LEGACY_PORT_SECRETS === "true" || env?.LEGACY_PORT_SECRETS === "1";
  return {
    secretHex,
    adminKey,
    keyEpoch,
    debug,
    decoyUrl,
    alertUrl,
    hostnames,
    extraHosts,
    maxStreams,
    bootstrapTtl,
    sessionTtl,
    sessionPath,
    wsPath,
    carrier,
    upBatchBytes,
    dataChunk,
    maxQueued,
    maxIsolateQueued,
    dc: CONFIG.dc,
    dcPort: CONFIG.dcPort,
    dcPorts: CONFIG.dcPorts,
    dcOverride,
    userLabels,
    legacyPortSecrets,
    issues,
    unknown: unknown.slice(0, 16),
    effectiveDc: dcOverride || CONFIG.dc
  };
}
__name(resolveConfig, "resolveConfig");
var USER_LABEL_MAX = 16;

// src/util.js
var te = new TextEncoder();
function concat(...parts) {
  let size = 0;
  for (const part of parts) size += part.length;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
__name(concat, "concat");
function reverse(bytes) {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[bytes.length - 1 - i];
  return out;
}
__name(reverse, "reverse");
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return out;
}
__name(hexToBytes, "hexToBytes");
function bytesToHex(bytes) {
  let text = "";
  for (let i = 0; i < bytes.length; i++) text += bytes[i].toString(16).padStart(2, "0");
  return text;
}
__name(bytesToHex, "bytesToHex");
function b64uEncode(bytes) {
  let text = "";
  for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64uEncode, "b64uEncode");
function b64uDecodeStrict(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const remainder = value.length % 4;
  if (remainder === 1) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - remainder) % 4));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return b64uEncode(out) === value ? out : null;
  } catch (_) {
    return null;
  }
}
__name(b64uDecodeStrict, "b64uDecodeStrict");
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(escapeHtml, "escapeHtml");
function safeEqual(a, b) {
  const x = te.encode(String(a));
  const y = te.encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}
__name(safeEqual, "safeEqual");
function fmtBytes(value) {
  const n = Number(value) || 0;
  if (n < 1024) return n + " B";
  if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
  if (n < 1073741824) return (n / 1048576).toFixed(1) + " MB";
  return (n / 1073741824).toFixed(2) + " GB";
}
__name(fmtBytes, "fmtBytes");
function fmtDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1e3));
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total % 86400 / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  if (days) return days + "d " + hours + "h";
  if (hours) return hours + "h " + minutes + "m";
  return minutes + "m " + total % 60 + "s";
}
__name(fmtDuration, "fmtDuration");
function requestHost(request, url) {
  let host = String(request.headers.get("host") || url.host || "").toLowerCase();
  if (host.endsWith(".")) host = host.slice(0, -1);
  if (host.startsWith("[")) return host;
  const colon = host.lastIndexOf(":");
  if (colon > 0 && host.indexOf(":") === colon) host = host.slice(0, colon);
  return host;
}
__name(requestHost, "requestHost");

// src/crypto.js
async function sha256(bytes) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}
__name(sha256, "sha256");
function importHmac(raw, usages) {
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, usages);
}
__name(importHmac, "importHmac");
function importAes(raw) {
  return crypto.subtle.importKey("raw", raw, { name: "AES-CTR" }, false, ["encrypt"]);
}
__name(importAes, "importAes");
function add128(iv, amount) {
  const out = new Uint8Array(iv);
  let carry = amount >>> 0;
  for (let i = 15; i >= 0 && carry !== 0; i--) {
    const sum = out[i] + (carry & 255);
    out[i] = sum & 255;
    carry = (carry >>> 8) + (sum >>> 8);
  }
  return out;
}
__name(add128, "add128");
async function ctrAt(key, iv, position, data) {
  const block = Math.floor(position / 16);
  const skip = position % 16;
  const counter = add128(iv, block);
  if (skip === 0) {
    return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CTR", counter, length: 64 }, key, data));
  }
  const input = new Uint8Array(skip + data.length);
  input.set(data, skip);
  const out = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CTR", counter, length: 64 }, key, input));
  return out.subarray(skip);
}
__name(ctrAt, "ctrAt");
async function hmacSign(key, data) {
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
}
__name(hmacSign, "hmacSign");
async function hmacVerify(key, sig, data) {
  return crypto.subtle.verify("HMAC", key, sig, data);
}
__name(hmacVerify, "hmacVerify");
function parseSecret(hexValue) {
  if (!hexValue) return null;
  let hex = String(hexValue).trim().toLowerCase();
  if (hex.startsWith("0x")) hex = hex.substring(2);
  if (!/^[0-9a-f]+$/.test(hex)) return null;
  if (hex.length === 32) return hexToBytes(hex);
  if (hex.length === 34 && hex.startsWith("dd")) return hexToBytes(hex.substring(2));
  if (hex.length === 64) return hexToBytes(hex);
  return null;
}
__name(parseSecret, "parseSecret");

// src/kdf.js
var sealCache = null;
async function legacySealBytes() {
  if (sealCache) return sealCache;
  const raw = atob(LEGACY_SEAL_B64);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  const salt = concat(TOKEN_DOMAIN, Uint8Array.of(80, 71, 1));
  const out = new Uint8Array(data.length);
  let stream = new Uint8Array(0);
  for (let block = 0; stream.length < data.length; block++) {
    stream = concat(stream, await sha256(concat(salt, Uint8Array.of(block))));
  }
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ stream[i];
  sealCache = out;
  return out;
}
__name(legacySealBytes, "legacySealBytes");
var BRAND_NAMES = ["LUXVEIL", "VELOURA", "AURELLE", "SARTORIA", "NOVELLE", "MAISONOIR", "ELYSANE", "VELVETTE"];
var PALETTES = [
  { accent: "#92400e", dark: "#7c3309", light: "#fef3c7" },
  { accent: "#155e75", dark: "#0e4a5f", light: "#cffafe" },
  { accent: "#4d7c0f", dark: "#3f6212", light: "#ecfccb" },
  { accent: "#86198f", dark: "#701a75", light: "#fae8ff" },
  { accent: "#9f1239", dark: "#881337", light: "#ffe4e6" },
  { accent: "#3730a3", dark: "#312e81", light: "#e0e7ff" }
];
var PRODUCT_SETS = [
  [["Wool Blend Overcoat", "Outerwear", "$385.00", ""], ["Relaxed Fit Blazer", "Tailoring", "$265.00", ""], ["Merino Turtleneck", "Knitwear", "$145.00", "$195.00"], ["Leather Crossbody Bag", "Accessories", "$220.00", ""]],
  [["Cashmere Cardigan", "Knitwear", "$410.00", ""], ["Silk Evening Dress", "Occasion", "$520.00", ""], ["Linen Wide Trousers", "Tailoring", "$175.00", "$220.00"], ["Suede Tote Bag", "Accessories", "$295.00", ""]],
  [["Trench Coat", "Outerwear", "$450.00", "$530.00"], ["Pleated Midi Skirt", "Occasion", "$190.00", ""], ["Ribbed Sweater Vest", "Knitwear", "$120.00", ""], ["Satin Scarf", "Accessories", "$85.00", ""]],
  [["Double-Breasted Coat", "Outerwear", "$540.00", ""], ["Velvet Blazer", "Tailoring", "$380.00", "$460.00"], ["Alpaca Crewneck", "Knitwear", "$210.00", ""], ["Chain Shoulder Bag", "Accessories", "$330.00", ""]]
];
var CITY_NAMES = [["London", "Dubai", "Paris"], ["Milan", "Doha", "Vienna"], ["Zurich", "Istanbul", "Rome"], ["Madrid", "Dusseldorf", "Lisbon"]];
function pick(list, byte) {
  return list[byte % list.length];
}
__name(pick, "pick");
async function deriveDecoyBrand(base) {
  const seed = await sha256(concat(KDF_DOMAIN, te.encode("decoy-brand\0"), base));
  const brand = pick(BRAND_NAMES, seed[0]);
  const palette = PALETTES[seed[1] % PALETTES.length];
  const products = PRODUCT_SETS[seed[2] % PRODUCT_SETS.length];
  const cities = CITY_NAMES[seed[3] % CITY_NAMES.length];
  const initials = brand.slice(0, 2);
  return { name: brand, initials, palette, products, cities };
}
__name(deriveDecoyBrand, "deriveDecoyBrand");
async function derivePaths(base) {
  const pathKey = await sha256(concat(KDF_DOMAIN, te.encode("path-key\0"), base));
  const sessionMac = await hmacSign(await importHmac(pathKey, ["sign"]), te.encode("session-path"));
  const wsMac = await hmacSign(await importHmac(pathKey, ["sign"]), te.encode("ws-path"));
  return {
    sessionPath: "/s/" + bytesToHex(sessionMac.subarray(0, 4)),
    wsPath: "/w/" + bytesToHex(wsMac.subarray(0, 4))
  };
}
__name(derivePaths, "derivePaths");
async function deriveUserSecrets(base, labels) {
  if (!base || !labels || !labels.length) return [];
  const userKey = await sha256(concat(KDF_DOMAIN, te.encode("user-key\0"), base));
  const hmac = await importHmac(userKey, ["sign", "verify"]);
  const out = [];
  for (const label of labels.slice(0, USER_MODE_LIMIT)) {
    const secret = (await hmacSign(hmac, te.encode("tgweb-user-secret-v1\n" + label))).subarray(0, 16);
    out.push({
      label,
      secret,
      secretHex: "dd" + bytesToHex(secret),
      keys: [
        await importHmac(secret, ["verify"]),
        await importHmac(concat(Uint8Array.of(221), secret), ["verify"])
      ]
    });
  }
  return out;
}
__name(deriveUserSecrets, "deriveUserSecrets");
async function buildRuntime(cfg) {
  const adminKey = cfg.adminKey && cfg.adminKey.length >= 16 ? cfg.adminKey : "";
  let base = parseSecret(cfg.secretHex);
  const secretDerived = !base && !!adminKey;
  if (secretDerived) {
    const seal = await legacySealBytes();
    base = (await sha256(concat(te.encode("proxygosha-secret-from-admin-v2\n"), seal, te.encode("\n" + adminKey)))).slice(0, 16);
  }
  if (!base) return null;
  const keyEpoch = cfg.keyEpoch || "";
  const tokenKey = await importHmac(
    await sha256(concat(KDF_DOMAIN, te.encode("token-key\0"), te.encode(keyEpoch + "\0"), base)),
    ["sign", "verify"]
  );
  const cookieKey = await sha256(concat(KDF_DOMAIN, te.encode("cookie-key\0"), base));
  const portSecrets = {};
  for (const p of HTTPS_PORTS) {
    let sBytes;
    if (p === 443) {
      sBytes = base;
    } else {
      sBytes = (await sha256(concat(te.encode("proxygosha-port-secret-v1\n"), base, te.encode("\n" + p)))).slice(0, 16);
    }
    portSecrets[p] = {
      secret: sBytes,
      secretHex: "dd" + bytesToHex(sBytes),
      keys: [
        await importHmac(sBytes, ["verify"]),
        await importHmac(concat(Uint8Array.of(221), sBytes), ["verify"])
      ]
    };
  }
  const bridgeKeys = [
    await importHmac(base, ["verify"]),
    await importHmac(concat(Uint8Array.of(221), base), ["verify"])
  ];
  const userSecrets = await deriveUserSecrets(base, cfg.userLabels);
  const brand = await deriveDecoyBrand(base);
  const derived = await derivePaths(base);
  const hosts = Array.isArray(cfg.hostnames) ? cfg.hostnames.map((value) => String(value).trim().toLowerCase()).filter(Boolean) : [];
  return {
    base,
    baseHex: "dd" + bytesToHex(base),
    portSecrets,
    bridgeKeys,
    userSecrets,
    adminKey,
    adminIssues: adminKeyIssues(cfg.adminKey),
    secretDerived,
    keyEpoch,
    keyEpochFingerprint: bytesToHex((await sha256(te.encode("epoch\0" + keyEpoch))).subarray(0, 4)),
    cookieKey,
    tokenKey,
    hosts,
    extraHosts: cfg.extraHosts || [],
    brand,
    decoyHtml: null,
    // built lazily by decoy.js
    sessionPath: cfg.sessionPath || derived.sessionPath,
    wsPath: cfg.wsPath || derived.wsPath,
    sessionPathDerived: !cfg.sessionPath,
    wsPathDerived: !cfg.wsPath,
    dc: cfg.effectiveDc,
    dcPort: cfg.dcPort,
    dcPorts: cfg.dcPorts,
    dcOverrideApplied: !!cfg.dcOverride,
    debug: cfg.debug,
    decoyUrl: cfg.decoyUrl,
    alertUrl: cfg.alertUrl,
    carrier: cfg.carrier,
    envIssues: cfg.issues,
    unknownEnv: cfg.unknown,
    legacyPortSecrets: cfg.legacyPortSecrets,
    streamWindow: cfg.streamWindow,
    maxQueued: cfg.maxQueued,
    maxIsolateQueued: cfg.maxIsolateQueued,
    maxStreams: cfg.maxStreams,
    dataChunk: cfg.dataChunk,
    upBatchBytes: cfg.upBatchBytes,
    bootstrapTtl: cfg.bootstrapTtl,
    sessionTtl: cfg.sessionTtl,
    batchBytes: cfg.batchBytes
  };
}
__name(buildRuntime, "buildRuntime");
async function issueToken(cfg, kind, ttl, mode, host) {
  const nonce = new Uint8Array(16);
  new DataView(nonce.buffer).setUint32(0, Math.floor(Date.now() / 1e3) + ttl, false);
  nonce[4] = typeof mode === "number" && mode >= 0 && mode <= 255 ? mode : 0;
  crypto.getRandomValues(nonce.subarray(5));
  const mac = await hmacSign(cfg.tokenKey, concat(TOKEN_DOMAIN, Uint8Array.of(kind), nonce, te.encode(host)));
  return b64uEncode(concat(nonce, mac));
}
__name(issueToken, "issueToken");
async function verifyToken(cfg, token, kind, host) {
  const raw = b64uDecodeStrict(token);
  if (!raw || raw.length !== 48) return null;
  const nonce = raw.subarray(0, 16);
  const mac = raw.subarray(16);
  const ok = await hmacVerify(cfg.tokenKey, mac, concat(TOKEN_DOMAIN, Uint8Array.of(kind), nonce, te.encode(host)));
  if (!ok) return null;
  const expires = new DataView(nonce.buffer, nonce.byteOffset, 4).getUint32(0, false);
  if (expires < Math.floor(Date.now() / 1e3)) return null;
  return { nonce, mode: nonce[4] };
}
__name(verifyToken, "verifyToken");
var COOKIE_NAME = "pg_panel";
var COOKIE_TTL = 6 * 3600;
async function issueCookie(cfg, host, now = Date.now()) {
  const exp = Math.floor(now / 1e3) + COOKIE_TTL;
  const mac = await hmacSign(await importHmac(cfg.cookieKey, ["sign"]), te.encode(`pg-admin-cookie-v1
${host}
${exp}`));
  return { value: `${exp}.${b64uEncode(mac)}`, maxAge: COOKIE_TTL };
}
__name(issueCookie, "issueCookie");
async function verifyCookie(cfg, host, cookieValue2, now = Date.now()) {
  if (typeof cookieValue2 !== "string") return false;
  const dot = cookieValue2.indexOf(".");
  if (dot <= 0) return false;
  const exp = cookieValue2.slice(0, dot);
  if (!/^[0-9]{10}$/.test(exp)) return false;
  if (parseInt(exp, 10) < Math.floor(now / 1e3)) return false;
  const expected = await hmacSign(await importHmac(cfg.cookieKey, ["sign"]), te.encode(`pg-admin-cookie-v1
${host}
${exp}`));
  const given = b64uDecodeStrict(cookieValue2.slice(dot + 1));
  if (!given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given[i] ^ expected[i];
  return diff === 0;
}
__name(verifyCookie, "verifyCookie");
var VERIFY_BUDGET = 24;
function bridgeContexts(host, port) {
  return port === 443 ? [te.encode("tdesktop-web-proxy-bridge-v1\n" + host)] : [
    te.encode(`tdesktop-web-proxy-bridge-v1
${host}:${port}`),
    te.encode("tdesktop-web-proxy-bridge-v1\n" + host)
  ];
}
__name(bridgeContexts, "bridgeContexts");
async function bridgeMode(cfg, host, capability, port) {
  const provided = b64uDecodeStrict(capability);
  if (!provided || provided.length !== 32) return -1;
  const incomingPort = port ? parseInt(port, 10) : 443;
  let budget = VERIFY_BUDGET;
  if (HTTPS_PORTS.includes(incomingPort) && cfg.portSecrets?.[incomingPort]) {
    const keys = cfg.portSecrets[incomingPort].keys;
    for (const ctx of bridgeContexts(host, incomingPort)) {
      for (const key of keys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
          return PORT_MODE_BASE + HTTPS_PORTS.indexOf(incomingPort);
        }
      }
    }
  }
  for (let i = 0; i < cfg.userSecrets.length; i++) {
    const user = cfg.userSecrets[i];
    for (const ctx of bridgeContexts(host, incomingPort)) {
      for (const key of user.keys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
          return USER_MODE_BASE + i;
        }
      }
    }
  }
  if (cfg.legacyPortSecrets) {
    const candidatePorts = [];
    if (port && port !== "443" && port !== "80") candidatePorts.push(port);
    for (const p of HTTPS_PORTS) if (p !== 443 && !candidatePorts.includes(String(p))) candidatePorts.push(String(p));
    const candidateHosts = [host, ...candidatePorts.map((p) => `${host}:${p}`)];
    for (const h of candidateHosts) {
      const context = te.encode("tdesktop-web-proxy-bridge-v1\n" + h);
      for (const key of cfg.bridgeKeys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, context)) {
          return PORT_MODE_BASE;
        }
      }
    }
    if (cfg.portSecrets) {
      for (let idx = 0; idx < HTTPS_PORTS.length; idx++) {
        const p = HTTPS_PORTS[idx];
        if (p === incomingPort) continue;
        const keys = cfg.portSecrets[p].keys;
        const contexts = [
          te.encode(`tdesktop-web-proxy-bridge-v1
${host}:${p}`),
          te.encode("tdesktop-web-proxy-bridge-v1\n" + host)
        ];
        for (const ctx of contexts) {
          for (const key of keys) {
            if (budget-- <= 0) return -1;
            if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
              if (!port || port === "443" || port === String(p)) {
                return PORT_MODE_BASE + idx;
              }
            }
          }
        }
      }
    }
  }
  return -1;
}
__name(bridgeMode, "bridgeMode");
async function modeSecret(cfg, mode, host, port) {
  if (mode >= PORT_MODE_BASE && mode < PORT_MODE_BASE + HTTPS_PORTS.length) {
    const portNum = HTTPS_PORTS[mode - PORT_MODE_BASE];
    return cfg.portSecrets?.[portNum]?.secret || cfg.base;
  }
  if (mode >= USER_MODE_BASE && mode < USER_MODE_BASE + USER_MODE_LIMIT) {
    return cfg.userSecrets[mode - USER_MODE_BASE]?.secret || null;
  }
  if (mode === 0) return cfg.base;
  return null;
}
__name(modeSecret, "modeSecret");

// src/decoy.js
var DECOY_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="__BRAND__ \u2014 Premium contemporary fashion. Curated collections of designer apparel, outerwear, and accessories for the modern wardrobe.">
<meta name="robots" content="index, follow">
<meta property="og:title" content="__BRAND__ \u2014 Contemporary Fashion House">
<meta property="og:type" content="website">
<title>__BRAND__ &mdash; Contemporary Fashion House</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#faf9f7;--surface:#fff;--text:#1a1a1a;--muted:#71717a;--accent:__ACCENT__;--accent-light:__ACCENT_LIGHT__;--border:#e4e4e7;--hover:#f4f4f5;--gold:#b8860b;--shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--shadow-lg:0 10px 25px rgba(0,0,0,.07),0 4px 10px rgba(0,0,0,.04)}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,-apple-system,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.announce{background:var(--text);color:#fff;text-align:center;padding:.55rem 1rem;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;overflow:hidden}
.announce-inner{display:inline-flex;gap:3rem;animation:marquee 25s linear infinite;white-space:nowrap}
nav{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);background:rgba(255,255,255,.92)}
.nav-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:.85rem 2rem}
.nav-logo{font-size:1.4rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase}
.nav-links{display:flex;gap:2rem;list-style:none;font-size:.88rem;font-weight:500;letter-spacing:.03em;text-transform:uppercase}
.nav-links a{position:relative;padding:.25rem 0;transition:color .2s}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--accent);transition:width .3s ease}
.nav-links a:hover::after{width:100%}
.nav-links a:hover{color:var(--accent)}
.nav-icons{display:flex;align-items:center;gap:1.25rem}
.nav-icons svg{width:20px;height:20px;stroke:var(--text);stroke-width:1.5;fill:none;cursor:pointer;transition:stroke .2s}
.nav-icons svg:hover{stroke:var(--accent)}
.cart-badge{position:relative}
.cart-badge::after{content:'2';position:absolute;top:-6px;right:-8px;background:var(--accent);color:#fff;font-size:.6rem;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
.hamburger{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:4px}
.hamburger span{width:20px;height:1.5px;background:var(--text);border-radius:1px}
.hero{max-width:1280px;margin:0 auto;padding:0 2rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;min-height:75vh;animation:fadeIn .8s ease}
.hero-text{animation:fadeUp .9s ease .1s both}
.hero-tag{display:inline-block;font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);background:var(--accent-light);padding:.35rem .9rem;border-radius:2rem;font-weight:600;margin-bottom:1.5rem}
.hero h1{font-size:3.5rem;font-weight:800;line-height:1.08;letter-spacing:-.02em;margin-bottom:1.25rem}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero p{font-size:1.1rem;color:var(--muted);max-width:460px;margin-bottom:2rem;line-height:1.7}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;border-radius:.4rem;font-size:.88rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;transition:all .25s ease;cursor:pointer;border:none}
.btn-primary{background:var(--text);color:#fff}
.btn-primary:hover{background:var(--accent);transform:translateY(-1px);box-shadow:var(--shadow-lg)}
.btn-outline{background:transparent;color:var(--text);border:1.5px solid var(--border)}
.btn-outline:hover{border-color:var(--text);background:var(--hover)}
.hero-visual{position:relative;animation:fadeUp .9s ease .3s both}
.hero-img{width:100%;aspect-ratio:3/4;background:linear-gradient(135deg,#e8e0d6 0%,#d4c8b8 30%,#c9b99a 60%,#b8a88a 100%);border-radius:1rem;overflow:hidden;position:relative}
.hero-img::before{content:'';position:absolute;inset:0;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%);background-size:200% 200%;animation:shimmer 4s ease-in-out infinite}
.hero-img::after{content:'__BRAND__';position:absolute;bottom:2rem;left:2rem;font-size:1.1rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.7);font-weight:300}
.hero-float{position:absolute;right:-1rem;top:25%;background:var(--surface);border-radius:.75rem;padding:1rem 1.25rem;box-shadow:var(--shadow-lg);animation:float 4s ease-in-out infinite;z-index:2}
.hero-float .hf-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.25rem}
.hero-float .hf-value{font-size:1.3rem;font-weight:700;color:var(--accent)}
.banner{background:var(--text);padding:1rem 0;overflow:hidden}
.banner-track{display:flex;gap:3rem;animation:marquee 20s linear infinite;white-space:nowrap}
.banner-track span{color:rgba(255,255,255,.6);font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;font-weight:500}
.section{max-width:1280px;margin:0 auto;padding:5rem 2rem}
.section-head{text-align:center;margin-bottom:3.5rem}
.section-head h2{font-size:2.2rem;font-weight:800;letter-spacing:-.01em;margin-bottom:.75rem}
.section-head p{color:var(--muted);font-size:1rem;max-width:480px;margin:0 auto}
.products{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
.product{cursor:pointer}
.product-img{aspect-ratio:3/4;border-radius:.75rem;overflow:hidden;position:relative;margin-bottom:1rem}
.product-img .img-fill{width:100%;height:100%;transition:transform .6s ease}
.product:hover .img-fill{transform:scale(1.06)}
.p1 .img-fill{background:linear-gradient(160deg,#c4b5a3,#a89279)}
.p2 .img-fill{background:linear-gradient(160deg,#2c2c2c,#555)}
.p3 .img-fill{background:linear-gradient(160deg,#8b7355,#c4a97d)}
.p4 .img-fill{background:linear-gradient(160deg,#d6cfc4,#a89888)}
.product-img .quick{position:absolute;bottom:0;left:0;right:0;background:rgba(26,26,26,.88);color:#fff;text-align:center;padding:.7rem;font-size:.78rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;transform:translateY(100%);transition:transform .35s ease;backdrop-filter:blur(4px)}
.product:hover .quick{transform:translateY(0)}
.product-info h3{font-size:.92rem;font-weight:600;margin-bottom:.3rem}
.product-info .cat{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
.product-info .price{font-size:.95rem;font-weight:700}
.product-info .price .old{text-decoration:line-through;color:var(--muted);font-weight:400;margin-left:.4rem;font-size:.85rem}
.product-colors{display:flex;gap:.35rem;margin-top:.5rem}
.product-colors span{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--border);transition:transform .2s}
.product-colors span:hover{transform:scale(1.3)}
.features{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:4rem}
.feature{text-align:center;padding:2rem 1.25rem;border-radius:.75rem;transition:all .3s ease}
.feature:hover{background:var(--surface);box-shadow:var(--shadow-lg);transform:translateY(-4px)}
.feature svg{width:32px;height:32px;stroke:var(--accent);stroke-width:1.5;fill:none;margin:0 auto 1rem}
.feature h4{font-size:.92rem;font-weight:700;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.04em}
.feature p{font-size:.82rem;color:var(--muted);line-height:1.6}
.lookbook{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:65vh;margin:5rem 0}
.lookbook-img{background:linear-gradient(160deg,#d4c4b0,#baa78c);position:relative;overflow:hidden}
.lookbook-img::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.2) 100%)}
.lookbook-content{display:flex;flex-direction:column;justify-content:center;padding:5rem 4rem;background:var(--surface)}
.lookbook-content .lb-tag{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.lookbook-content h2{font-size:2.8rem;font-weight:800;line-height:1.1;margin-bottom:1.25rem}
.lookbook-content p{color:var(--muted);font-size:1rem;line-height:1.8;margin-bottom:2rem;max-width:400px}
.reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.review{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:2rem;transition:box-shadow .3s,transform .3s}
.review:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}
.review-stars{color:var(--gold);font-size:.85rem;margin-bottom:.75rem;letter-spacing:2px}
.review p{font-size:.9rem;color:var(--text);line-height:1.7;margin-bottom:1rem;font-style:italic}
.review-author{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.newsletter{text-align:center;background:var(--text);color:#fff;padding:5rem 2rem}
.newsletter h2{font-size:2rem;font-weight:800;margin-bottom:.75rem}
.newsletter p{color:rgba(255,255,255,.55);margin-bottom:2rem;font-size:.95rem}
.newsletter-form{display:flex;max-width:460px;margin:0 auto;border-radius:.4rem;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.2)}
.newsletter-form input{flex:1;padding:.9rem 1.25rem;border:none;font-size:.88rem;outline:none;background:#fff;color:var(--text)}
.newsletter-form button{padding:.9rem 1.8rem;background:var(--accent);color:#fff;border:none;font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s;white-space:nowrap}
footer{background:var(--surface);border-top:1px solid var(--border);padding:4rem 2rem 2rem}
.footer-inner{max-width:1280px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
.footer-brand .f-logo{font-size:1.2rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.75rem}
.footer-brand p{color:var(--muted);font-size:.85rem;line-height:1.7;max-width:280px}
.footer-col h5{font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem}
.footer-col ul{list-style:none}
.footer-col li{margin-bottom:.5rem}
.footer-col a{font-size:.88rem;color:var(--text);transition:color .2s}
.footer-col a:hover{color:var(--accent)}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:2rem;border-top:1px solid var(--border);font-size:.78rem;color:var(--muted)}
.footer-social{display:flex;gap:1rem}
.footer-social svg{width:18px;height:18px;stroke:var(--muted);stroke-width:1.5;fill:none;transition:stroke .2s;cursor:pointer}
.footer-social svg:hover{stroke:var(--accent)}
@media(max-width:1024px){
.hero{grid-template-columns:1fr;text-align:center;min-height:auto;padding-top:3rem}
.hero h1{font-size:2.6rem}
.hero p{margin:0 auto 2rem}
.hero-btns{justify-content:center}
.hero-visual{max-width:400px;margin:0 auto}
.hero-float{display:none}
.products{grid-template-columns:repeat(2,1fr)}
.features{grid-template-columns:repeat(2,1fr)}
.lookbook{grid-template-columns:1fr}
.lookbook-content{padding:3rem 2rem}
.footer-grid{grid-template-columns:1fr 1fr}
.reviews{grid-template-columns:1fr}
}
@media(max-width:640px){
.nav-links{display:none}
.hamburger{display:flex}
.hero h1{font-size:2rem}
.products,.features,.footer-grid{grid-template-columns:1fr}
.newsletter-form{flex-direction:column}
.newsletter-form input,.newsletter-form button{width:100%}
.lookbook-content h2{font-size:2rem}
}
</style>
</head>
<body>
<div class="announce"><div class="announce-inner"><span>Free express shipping on orders over $150</span><span>&bull;</span><span>New Season &mdash; Autumn/Winter 2026 Collection now live</span><span>&bull;</span><span>Complimentary gift wrapping on all orders</span><span>&bull;</span><span>Free express shipping on orders over $150</span><span>&bull;</span><span>New Season &mdash; Autumn/Winter 2026 Collection now live</span><span>&bull;</span><span>Complimentary gift wrapping on all orders</span></div></div>
<nav><div class="nav-inner"><a href="/" class="nav-logo">__BRAND__</a><ul class="nav-links"><li><a href="/">New Arrivals</a></li><li><a href="/">Women</a></li><li><a href="/">Men</a></li><li><a href="/">Outerwear</a></li><li><a href="/">Accessories</a></li><li><a href="/">Sale</a></li></ul><div class="nav-icons"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="cart-badge"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div><div class="hamburger"><span></span><span></span><span></span></div></div></div></nav>
<section class="hero"><div class="hero-text"><div class="hero-tag">Autumn/Winter 2026</div><h1>Redefine Your<br><em>Everyday</em> Elegance</h1><p>Discover our latest collection of meticulously crafted garments, designed with premium fabrics and contemporary silhouettes for the modern wardrobe.</p><div class="hero-btns"><a href="/" class="btn btn-primary">Shop Collection <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a><a href="/" class="btn btn-outline">Lookbook</a></div></div><div class="hero-visual"><div class="hero-img"></div><div class="hero-float"><div class="hf-label">Best Seller</div><div class="hf-value">__PRODUCT1__</div></div></div></section>
<div class="banner"><div class="banner-track"><span>Premium Quality</span><span>&#10022;</span><span>Sustainable Materials</span><span>&#10022;</span><span>Handcrafted Details</span><span>&#10022;</span><span>Worldwide Delivery</span><span>&#10022;</span><span>30-Day Returns</span><span>&#10022;</span><span>Premium Quality</span><span>&#10022;</span><span>Sustainable Materials</span><span>&#10022;</span><span>Handcrafted Details</span><span>&#10022;</span><span>Worldwide Delivery</span><span>&#10022;</span><span>30-Day Returns</span></div></div>
<section class="section"><div class="section-head"><h2>Curated Essentials</h2><p>Timeless pieces designed to transition seamlessly from season to season.</p></div><div class="products"><div class="product"><div class="product-img p1"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT1__</div><h3>__PRODUCT1__</h3><div class="price">__PRICE1__</div><div class="product-colors"><span style="background:#c4b5a3"></span><span style="background:#2c2c2c"></span><span style="background:#8b7355"></span></div></div></div><div class="product"><div class="product-img p2"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT2__</div><h3>__PRODUCT2__</h3><div class="price">__PRICE2__</div><div class="product-colors"><span style="background:#2c2c2c"></span><span style="background:#3d4f5f"></span></div></div></div><div class="product"><div class="product-img p3"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT3__</div><h3>__PRODUCT3__</h3><div class="price">__PRICE3__ <span class="old">__OLDPRICE3__</span></div><div class="product-colors"><span style="background:#8b7355"></span><span style="background:#f5f0eb"></span><span style="background:#4a3728"></span></div></div></div><div class="product"><div class="product-img p4"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT4__</div><h3>__PRODUCT4__</h3><div class="price">__PRICE4__</div><div class="product-colors"><span style="background:#d6cfc4"></span><span style="background:#2c2c2c"></span></div></div></div></div></section>
<section class="section" style="padding-top:0"><div class="features"><div class="feature"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l4 2v4l-4 2"/></svg><h4>Free Shipping</h4><p>Complimentary express delivery on all orders over $150. Worldwide tracked shipping.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><h4>Secure Checkout</h4><p>256-bit SSL encryption with trusted payment partners. Your data is always protected.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6"/><path d="M22 4L12 14.01l-3-3"/></svg><h4>Quality Guarantee</h4><p>Every garment is inspected for quality. 30-day hassle-free returns and exchanges.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg><h4>Sustainable Fashion</h4><p>Ethically sourced materials with carbon-neutral shipping. Fashion with a conscience.</p></div></div></section>
<section class="lookbook"><div class="lookbook-img"></div><div class="lookbook-content"><div class="lb-tag">The Lookbook</div><h2>Autumn<br>Silhouettes</h2><p>Explore our editorial collection featuring rich tonal palettes, luxurious textures, and the defining shapes of the season. Each piece tells a story of understated refinement.</p><a href="/" class="btn btn-primary">View Lookbook</a></div></section>
<section class="section"><div class="section-head"><h2>What Our Clients Say</h2><p>Trusted by thousands of discerning customers worldwide.</p></div><div class="reviews"><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;The quality of the __PRODUCT1_LC__ exceeded my expectations. Impeccable tailoring and the fabric feels absolutely luxurious.&rdquo;</p><div class="review-author">&mdash; Sarah M., __CITY1__</div></div><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;Fast shipping to __CITY2__ and the packaging was beautiful. The __PRODUCT3_LC__ is now my go-to piece for every occasion.&rdquo;</p><div class="review-author">&mdash; Ahmed K., __CITY2__</div></div><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;Finally found a brand that combines minimalist design with real craftsmanship. The __PRODUCT2_LC__ fits perfectly &mdash; no alterations needed.&rdquo;</p><div class="review-author">&mdash; Elena V., __CITY3__</div></div></div></section>
<section class="newsletter"><h2>Join the __BRAND__ World</h2><p>Subscribe for exclusive access to new collections, private sales, and style inspiration.</p><div class="newsletter-form"><input type="email" placeholder="Enter your email address" autocomplete="off"><button type="button">Subscribe</button></div></section>
<footer><div class="footer-inner"><div class="footer-grid"><div class="footer-brand"><div class="f-logo">__BRAND__</div><p>Contemporary fashion house crafting timeless garments with modern sensibility. Established 2019, shipping worldwide from our ateliers in __CITY3__ and __CITY1__.</p></div><div class="footer-col"><h5>Shop</h5><ul><li><a href="/">New Arrivals</a></li><li><a href="/">Women</a></li><li><a href="/">Men</a></li><li><a href="/">Outerwear</a></li><li><a href="/">Accessories</a></li><li><a href="/">Sale</a></li></ul></div><div class="footer-col"><h5>Company</h5><ul><li><a href="/">About Us</a></li><li><a href="/">Sustainability</a></li><li><a href="/">Careers</a></li><li><a href="/">Press</a></li><li><a href="/">Store Locator</a></li></ul></div><div class="footer-col"><h5>Support</h5><ul><li><a href="/">Contact Us</a></li><li><a href="/">Shipping &amp; Returns</a></li><li><a href="/">Size Guide</a></li><li><a href="/">FAQ</a></li><li><a href="/">Privacy Policy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; 2026 __BRAND__ Ltd. All rights reserved.</span><div class="footer-social"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg><svg viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div></div></div></footer>
</body>
</html>`;
function brandifyDecoy(template, brand) {
  const [p1, p2, p3, p4] = brand.products;
  const [c1, c2, c3] = brand.cities;
  const lower = /* @__PURE__ */ __name((s) => s.toLowerCase(), "lower");
  const map = {
    __BRAND__: brand.name,
    __ACCENT__: brand.palette.accent,
    __ACCENT_LIGHT__: brand.palette.light,
    __PRODUCT1__: p1[0],
    __PRODUCT2__: p2[0],
    __PRODUCT3__: p3[0],
    __PRODUCT4__: p4[0],
    __PRODUCT1_LC__: lower(p1[0]),
    __PRODUCT2_LC__: lower(p2[0]),
    __PRODUCT3_LC__: lower(p3[0]),
    __CAT1__: p1[1],
    __CAT2__: p2[1],
    __CAT3__: p3[1],
    __CAT4__: p4[1],
    __PRICE1__: p1[2],
    __PRICE2__: p2[2],
    __PRICE3__: p3[2],
    __PRICE4__: p4[2],
    __OLDPRICE3__: p3[3],
    __CITY1__: c1,
    __CITY2__: c2,
    __CITY3__: c3
  };
  let out = template;
  for (const [k, v] of Object.entries(map)) out = out.split(k).join(escapeHtml(v));
  return out;
}
__name(brandifyDecoy, "brandifyDecoy");
function healthJson(brand, nowSeconds = Math.floor(Date.now() / 1e3)) {
  return JSON.stringify({ status: "operational", store: brand.name, region: "global", uptime: "99.99%", timestamp: nowSeconds });
}
__name(healthJson, "healthJson");
function faviconSvg(brand) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1a1a1a"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="14" fill="#fff" letter-spacing="2">${escapeHtml(brand.initials)}</text></svg>`;
}
__name(faviconSvg, "faviconSvg");
function sha256HexSync(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
__name(sha256HexSync, "sha256HexSync");
async function decoy(cfg, requestMethod = "GET") {
  const head = requestMethod === "HEAD";
  if (cfg && cfg.decoyUrl && typeof cfg.decoyUrl === "string" && /^https:\/\//.test(cfg.decoyUrl)) {
    const cacheKey = new Request("https://pgdecoy.edge-cache.internal/" + sha256HexSync(cfg.decoyUrl));
    try {
      const hit = await caches.default.match(cacheKey);
      if (hit) {
        return new Response(head ? null : hit.body, { status: hit.status, headers: hit.headers });
      }
    } catch (_) {
    }
    try {
      const upstream = await fetch(cfg.decoyUrl, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" }
      });
      const headers2 = new Headers();
      headers2.set("Content-Type", upstream.headers.get("Content-Type") || "text/html; charset=utf-8");
      headers2.set("Cache-Control", "public, max-age=60");
      headers2.set("X-Content-Type-Options", "nosniff");
      headers2.set("Vary", "Accept-Encoding");
      const cached = new Response(upstream.body, { status: upstream.status, headers: headers2 });
      const reply = cached.clone();
      try {
        await caches.default.put(cacheKey, cached);
      } catch (_) {
      }
      return new Response(head ? null : reply.body, { status: reply.status, headers: reply.headers });
    } catch (_) {
    }
  }
  const html = cfg && cfg.decoyHtml ? cfg.decoyHtml : brandifyDecoy(DECOY_TEMPLATE, { name: "LUXVEIL", initials: "LV", palette: { accent: "#92400e", dark: "#7c3309", light: "#fef3c7" }, products: [["Cashmere Overcoat", "Outerwear", "$385.00", ""], ["Relaxed Fit Blazer", "Tailoring", "$265.00", ""], ["Merino Turtleneck", "Knitwear", "$145.00", "$195.00"], ["Leather Crossbody Bag", "Accessories", "$220.00", ""]], cities: ["London", "Dubai", "Paris"] });
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Accept-Encoding"
  };
  return new Response(head ? null : html, { status: 200, headers });
}
__name(decoy, "decoy");

// src/telemetry.js
var ISOLATE_START = Date.now();
var STATS = {
  sessions: 0,
  // WebSocket proxy sessions created in this isolate
  sessionsActive: 0,
  // currently open in this isolate
  streams: 0,
  // MTProto streams opened in this isolate
  dcAttempts: 0,
  // outbound TCP connects to Telegram DCs
  dcFails: 0,
  // failed DC connects
  bytesUp: 0,
  // client -> Telegram bytes (approximate)
  bytesDown: 0,
  // Telegram -> client bytes (approximate)
  wsRejects: 0,
  // WebSocket handshakes rejected (bad/expired token)
  panelViews: 0,
  statusViews: 0,
  cpuSuspect: 0,
  // sessions killed by an abrupt socket event (see note in /status)
  alerted: 0
  // optional webhook alerts sent (only when ALERT_URL is set)
};
var DC_EMA = /* @__PURE__ */ Object.create(null);
var DC_LAST_GOOD = /* @__PURE__ */ new Map();
var DC_DEMOTED = /* @__PURE__ */ new Map();
var DC_DEMOTE_MS = 6e4;
var USER_SESSIONS = /* @__PURE__ */ Object.create(null);
var MEMORY = {
  queued: 0,
  cap: 33554432,
  get pressure() {
    return this.cap > 0 ? this.queued / this.cap : 0;
  }
};
function memoryAdd(bytes) {
  MEMORY.queued += bytes;
}
__name(memoryAdd, "memoryAdd");
function memorySub(bytes) {
  MEMORY.queued = Math.max(0, MEMORY.queued - bytes);
}
__name(memorySub, "memorySub");
var LOG = [];
var LOG_LIMIT = 120;
function logEvent(event, detail) {
  try {
    LOG.push({ t: Date.now(), event: String(event).slice(0, 24), detail: String(detail || "").slice(0, 120) });
    if (LOG.length > LOG_LIMIT) LOG.splice(0, LOG.length - LOG_LIMIT);
  } catch (_) {
  }
}
__name(logEvent, "logEvent");
function logSnapshot(limit = 60) {
  return LOG.slice(-limit).reverse();
}
__name(logSnapshot, "logSnapshot");
var LOGIN_GATE = {
  fails: 0,
  lockedUntil: 0,
  threshold: 5,
  baseLockMs: 3e4,
  maxLockMs: 9e5
};
function loginLocked(now = Date.now()) {
  return now < LOGIN_GATE.lockedUntil;
}
__name(loginLocked, "loginLocked");
function loginFailure(now = Date.now()) {
  LOGIN_GATE.fails += 1;
  if (LOGIN_GATE.fails >= LOGIN_GATE.threshold) {
    const over = LOGIN_GATE.fails - LOGIN_GATE.threshold;
    const lock = Math.min(LOGIN_GATE.baseLockMs * 2 ** Math.min(over, 10), LOGIN_GATE.maxLockMs);
    LOGIN_GATE.lockedUntil = now + lock;
  }
}
__name(loginFailure, "loginFailure");
function loginSuccess() {
  LOGIN_GATE.fails = 0;
  LOGIN_GATE.lockedUntil = 0;
}
__name(loginSuccess, "loginSuccess");

// src/alerts.js
var ALERT_LAST = /* @__PURE__ */ Object.create(null);
var ALERT_MIN_INTERVAL_MS = 3e5;
async function maybeAlert(cfg, type, detail) {
  if (!cfg || !cfg.alertUrl) return;
  const now = Date.now();
  if (now - (ALERT_LAST[type] || 0) < ALERT_MIN_INTERVAL_MS) return;
  ALERT_LAST[type] = now;
  try {
    await fetch(cfg.alertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: "ProxyGosha", version: VERSION, type, detail: String(detail).slice(0, 200), at: (/* @__PURE__ */ new Date()).toISOString() })
    });
    STATS.alerted++;
    logEvent("alert_sent", type);
  } catch (e) {
    logEvent("alert_fail", e && e.name ? e.name : "unknown");
  }
}
__name(maybeAlert, "maybeAlert");

// src/protocol.js
var EMPTY = new Uint8Array(0);
var WELCOME = new Uint8Array([17, 0, 0, 0, 0, 0, 0, 0]);
function frame(type, id, payload) {
  const out = new Uint8Array(8 + payload.length);
  out[0] = type;
  out[1] = id >>> 16 & 255;
  out[2] = id >>> 8 & 255;
  out[3] = id & 255;
  new DataView(out.buffer).setUint32(4, payload.length, false);
  out.set(payload, 8);
  return out;
}
__name(frame, "frame");
function windowFrame(id, amount) {
  const payload = new Uint8Array(4);
  new DataView(payload.buffer).setUint32(0, amount, false);
  return frame(4, id, payload);
}
__name(windowFrame, "windowFrame");
function tagKind(tag) {
  if (tag[0] === 239 && tag[1] === 239 && tag[2] === 239 && tag[3] === 239) return 1;
  if (tag[0] === 238 && tag[1] === 238 && tag[2] === 238 && tag[3] === 238) return 2;
  if (tag[0] === 221 && tag[1] === 221 && tag[2] === 221 && tag[3] === 221) return 3;
  return 0;
}
__name(tagKind, "tagKind");
function safeDcHeaderPrefix(bytes) {
  if (bytes[0] === 239) return false;
  if (bytes[4] === 0 && bytes[5] === 0 && bytes[6] === 0 && bytes[7] === 0) return false;
  if (bytes[0] === 71 && bytes[1] === 69 && bytes[2] === 84 && bytes[3] === 32) return false;
  if (bytes[0] === 80 && bytes[1] === 79 && bytes[2] === 83 && bytes[3] === 84) return false;
  if (bytes[0] === 72 && bytes[1] === 69 && bytes[2] === 65 && bytes[3] === 68) return false;
  if (bytes[0] === 79 && bytes[1] === 80 && bytes[2] === 84 && bytes[3] === 73) return false;
  if (bytes[0] === 238 && bytes[1] === 238 && bytes[2] === 238 && bytes[3] === 238) return false;
  if (bytes[0] === 221 && bytes[1] === 221 && bytes[2] === 221 && bytes[3] === 221) return false;
  if (bytes[0] === 22 && bytes[1] === 3 && bytes[2] === 1 && bytes[3] === 2) return false;
  return true;
}
__name(safeDcHeaderPrefix, "safeDcHeaderPrefix");
function ipDemoted(ip, port, now = Date.now()) {
  const until = DC_DEMOTED.get(ip + ":" + port);
  return typeof until === "number" && until > now;
}
__name(ipDemoted, "ipDemoted");
function orderCandidates(dcKey, ips, ports, now = Date.now()) {
  const attempts = [];
  for (const port of ports) for (const ip of ips) attempts.push([ip, port]);
  for (let i = attempts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [attempts[i], attempts[j]] = [attempts[j], attempts[i]];
  }
  const last = DC_LAST_GOOD.get(dcKey);
  if (last && !ipDemoted(last.ip, last.port, now)) {
    const idx = attempts.findIndex(([ip, port]) => ip === last.ip && port === last.port);
    if (idx > 0) attempts.unshift(attempts.splice(idx, 1)[0]);
  }
  attempts.sort((a, b) => Number(ipDemoted(a[0], a[1], now)) - Number(ipDemoted(b[0], b[1], now)));
  return attempts;
}
__name(orderCandidates, "orderCandidates");
var CONNECT_TIMEOUT_MS = 3e3;
var CONNECT_STAGGER_MS = 400;
async function connectOnce(connectFn, ip, port, timeoutMs) {
  const socket = connectFn({ hostname: ip, port }, { secureTransport: "off" });
  socket.closed.catch(() => {
  });
  let timer = null;
  try {
    await Promise.race([
      socket.opened,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("connect timeout")), timeoutMs);
      })
    ]);
    return socket;
  } catch (e) {
    try {
      socket.close().catch(() => {
      });
    } catch (_) {
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
__name(connectOnce, "connectOnce");
async function connectDc(connectFn, dcKey, ips, ports) {
  const candidates = orderCandidates(dcKey, ips, ports).slice(0, 3);
  const started = Date.now();
  let firstError = null;
  let inFlight = 0;
  return await new Promise((resolve) => {
    let settled = false;
    let launched = 0;
    const finish = /* @__PURE__ */ __name((socket, err) => {
      if (settled) return;
      settled = true;
      if (socket) {
        DC_LAST_GOOD.set(dcKey, { ip: socket._pgIp, port: socket._pgPort, at: Date.now() });
        const ms = Date.now() - started;
        DC_EMA[dcKey] = DC_EMA[dcKey] === void 0 ? ms : Math.round(DC_EMA[dcKey] * 0.7 + ms * 0.3);
        resolve(socket);
      } else {
        resolve(null);
      }
    }, "finish");
    const launch = /* @__PURE__ */ __name(() => {
      if (settled || launched >= candidates.length) return;
      const [ip, port] = candidates[launched++];
      inFlight++;
      STATS.dcAttempts++;
      connectOnce(connectFn, ip, port, CONNECT_TIMEOUT_MS).then((socket) => {
        inFlight--;
        if (settled) {
          try {
            socket.close().catch(() => {
            });
          } catch (_) {
          }
          return;
        }
        socket._pgIp = ip;
        socket._pgPort = port;
        finish(socket, null);
      }).catch((err) => {
        inFlight--;
        DC_DEMOTED.set(ip + ":" + port, Date.now() + DC_DEMOTE_MS);
        STATS.dcFails++;
        if (!firstError) firstError = err;
        if (inFlight === 0 && launched >= candidates.length) finish(null, firstError);
        else if (launched < candidates.length) launch();
      });
    }, "launch");
    launch();
    if (candidates.length > 1) setTimeout(() => {
      if (!settled && inFlight > 0 && launched < candidates.length) launch();
    }, CONNECT_STAGGER_MS);
  });
}
__name(connectDc, "connectDc");
function effectiveStreamWindow(cfg) {
  const pressure = MEMORY.pressure;
  if (pressure < 0.5) return cfg.streamWindow;
  if (pressure < 0.8) return Math.max(262144, cfg.streamWindow >> 2);
  return Math.max(65536, cfg.streamWindow >> 4);
}
__name(effectiveStreamWindow, "effectiveStreamWindow");
var Stream = class {
  static {
    __name(this, "Stream");
  }
  constructor(session, id) {
    this.session = session;
    this.id = id;
    STATS.streams++;
    session.streamCount++;
    this.phase = "header";
    this.header = new Uint8Array(64);
    this.headerLength = 0;
    this.dead = false;
    this.socket = null;
    this.writer = null;
    this.reader = null;
    this.inQueue = [];
    this.inRunning = false;
    this.queuedLocal = 0;
    this.recvOutstanding = 0;
    this.sendCredit = effectiveStreamWindow(session.cfg);
    this.creditResolve = null;
    this.clientReadKey = null;
    this.clientReadIv = null;
    this.clientWriteKey = null;
    this.clientWriteIv = null;
    this.dcWriteKey = null;
    this.dcWriteIv = null;
    this.dcReadKey = null;
    this.dcReadIv = null;
    this.clientReadPos = 64;
    this.clientWritePos = 0;
    this.dcWritePos = 64;
    this.dcReadPos = 0;
  }
  // F3: avoid the per-frame copy when the payload already owns its whole
  // underlying buffer (single-frame message). Subarrays sharing a larger
  // message buffer are still copied, so no whole-batch ArrayBuffer is pinned.
  feed(payload) {
    if (this.dead || !payload.length) return;
    this.recvOutstanding += payload.length;
    if (this.recvOutstanding > this.session.cfg.streamWindow + 65536) {
      this.kill(true);
      return;
    }
    const ownsBuffer = payload.byteOffset === 0 && payload.byteLength === payload.buffer.byteLength;
    const stored = ownsBuffer ? payload : payload.slice();
    this.inQueue.push(stored);
    this.queuedLocal += stored.length;
    this.session.queued += stored.length;
    memoryAdd(stored.length);
    if (MEMORY.queued > this.session.cfg.maxIsolateQueued || this.session.queued > this.session.cfg.maxQueued) {
      logEvent("mem_guard", `isolate=${Math.round(MEMORY.queued / 1048576)}MB session=${Math.round(this.session.queued / 1048576)}MB`);
      this.kill(true);
      return;
    }
    this.runIn();
  }
  async runIn() {
    if (this.inRunning || this.dead) return;
    this.inRunning = true;
    try {
      await Promise.resolve();
      while (!this.dead && this.inQueue.length) {
        let payload = this.inQueue[0];
        if (this.phase === "header") {
          const need = 64 - this.headerLength;
          const take = Math.min(need, payload.length);
          this.header.set(payload.subarray(0, take), this.headerLength);
          this.headerLength += take;
          payload = payload.subarray(take);
          this.takeAccounting(take);
          if (payload.length) this.inQueue[0] = payload;
          else this.inQueue.shift();
          if (this.headerLength === 64) {
            await this.init();
            this.grant(64);
          }
          continue;
        }
        this.inQueue.shift();
        let total = payload.length;
        const batch = [payload];
        const limit = this.session.cfg.upBatchBytes;
        while (this.inQueue.length && total < limit) {
          const next = this.inQueue[0];
          if (total + next.length > limit) break;
          batch.push(next);
          total += next.length;
          this.inQueue.shift();
        }
        this.takeAccounting(total);
        await this.writeToDcBatch(batch, total);
      }
    } catch (e) {
      logEvent("stream_err", e && e.name ? e.name : "unknown");
      this.kill(true);
    } finally {
      this.inRunning = false;
      if (!this.dead && this.inQueue.length) this.runIn();
    }
  }
  takeAccounting(bytes) {
    this.queuedLocal -= bytes;
    this.session.queued = Math.max(0, this.session.queued - bytes);
    memorySub(bytes);
  }
  async init() {
    const header = this.header;
    const readKey = await sha256(concat(header.subarray(8, 40), this.session.secret));
    const readIv = header.slice(40, 56);
    this.clientReadKey = await importAes(readKey);
    this.clientReadIv = readIv;
    const tail = await ctrAt(this.clientReadKey, readIv, 56, header.subarray(56, 64));
    const tag = tail.subarray(0, 4);
    if (!tagKind(tag)) throw new Error("bad tag");
    const dcId = new DataView(tail.buffer, tail.byteOffset + 4, 2).getInt16(0, true);
    const dcKey = Math.abs(dcId);
    const address = this.session.cfg.dc[dcKey];
    if (!address) throw new Error("bad dc");
    const candidateIps = Array.isArray(address) ? address : [address];
    const candidatePorts = Array.isArray(this.session.cfg.dcPorts) ? this.session.cfg.dcPorts : [this.session.cfg.dcPort || 443];
    const reversed = reverse(header.subarray(8, 56));
    const writeKey = await sha256(concat(reversed.subarray(0, 32), this.session.secret));
    const clientWriteIv = reversed.slice(32, 48);
    const dcKeyMaterial = reverse(concat(writeKey, clientWriteIv));
    this.dcWriteKey = await importAes(dcKeyMaterial.slice(0, 32));
    this.dcWriteIv = dcKeyMaterial.slice(32, 48);
    if (this.dead) return;
    this.clientReadPos = 64;
    this.clientWritePos = 0;
    this.dcWritePos = 64;
    this.dcReadPos = 0;
    const socket = await connectDc(this.session.connectFn, dcKey, candidateIps, candidatePorts);
    if (!socket) {
      logEvent("dc_fail", `dc=${dcKey}`);
      maybeAlert(this.session.cfg, "dc_fail", "dc=" + dcKey);
      throw new Error("failed to connect to DC");
    }
    this.socket = socket;
    if (this.dead) {
      try {
        await socket.close();
      } catch (_) {
      }
      return;
    }
    this.writer = socket.writable.getWriter();
    this.reader = socket.readable.getReader();
    const dcHeader = new Uint8Array(64);
    let safe = false;
    for (let i = 0; i < 16 && !safe; i++) {
      crypto.getRandomValues(dcHeader.subarray(0, 8));
      safe = safeDcHeaderPrefix(dcHeader);
    }
    if (!safe) dcHeader.set([18, 52, 86, 120, 154, 188, 222, 240], 0);
    dcHeader.set(dcKeyMaterial, 8);
    dcHeader.set(tag, 56);
    const dcView = new DataView(dcHeader.buffer);
    dcView.setInt16(60, dcId, true);
    dcView.setUint16(62, 0, true);
    const encryptedTail = await ctrAt(this.dcWriteKey, this.dcWriteIv, 56, dcHeader.subarray(56, 64));
    dcHeader.set(encryptedTail, 56);
    await this.writer.write(dcHeader);
    if (this.dead) return;
    this.phase = "ready";
    this.pump().catch(() => this.kill(true));
  }
  // F1: byte-identical to the old per-frame path (proven by test): one ctrAt
  // over clientRead keystream, one over dcWrite keystream, one write, one
  // WINDOW grant for the total.
  async writeToDcBatch(batch, total) {
    if (this.dead || !total) return;
    let plain;
    if (batch.length === 1) {
      plain = await ctrAt(this.clientReadKey, this.clientReadIv, this.clientReadPos, batch[0]);
    } else {
      const joined = new Uint8Array(total);
      let offset = 0;
      for (const part of batch) {
        joined.set(part, offset);
        offset += part.length;
      }
      plain = await ctrAt(this.clientReadKey, this.clientReadIv, this.clientReadPos, joined);
    }
    this.clientReadPos += total;
    if (this.dead) return;
    const encrypted = await ctrAt(this.dcWriteKey, this.dcWriteIv, this.dcWritePos, plain);
    this.dcWritePos += total;
    await this.writer.write(encrypted);
    this.grant(total);
  }
  async pump() {
    const reader = this.reader;
    try {
      while (!this.dead) {
        if (this.sendCredit <= 0) {
          await this.waitCredit();
          continue;
        }
        const result = await reader.read();
        if (result.done) break;
        const value = result.value;
        let offset = 0;
        while (offset < value.length && !this.dead) {
          if (this.sendCredit <= 0) {
            await this.waitCredit();
            continue;
          }
          const size = Math.min(value.length - offset, this.sendCredit, this.session.cfg.dataChunk);
          if (size <= 0) continue;
          const chunk = value.subarray(offset, offset + size);
          this.sendCredit -= size;
          this.session.sendFrame(frame(2, this.id, chunk));
          offset += size;
        }
      }
    } catch (_) {
    }
    this.kill(true);
  }
  waitCredit() {
    if (this.dead || this.sendCredit > 0) return Promise.resolve();
    return new Promise((resolve) => {
      this.creditResolve = resolve;
    });
  }
  addCredit(amount) {
    if (this.dead) return;
    this.sendCredit = Math.min(4294967295, this.sendCredit + amount);
    if (this.creditResolve) {
      const resolve = this.creditResolve;
      this.creditResolve = null;
      resolve();
    }
  }
  grant(amount) {
    if (this.dead || amount <= 0) return;
    this.recvOutstanding = Math.max(0, this.recvOutstanding - amount);
    this.session.sendFrame(windowFrame(this.id, amount));
  }
  kill(notify) {
    if (this.dead) return;
    this.dead = true;
    this.session.streams.delete(this.id);
    this.session.remember(this.id);
    this.session.queued = Math.max(0, this.session.queued - this.queuedLocal);
    memorySub(this.queuedLocal);
    this.queuedLocal = 0;
    this.inQueue.length = 0;
    if (this.creditResolve) {
      const resolve = this.creditResolve;
      this.creditResolve = null;
      resolve();
    }
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (_) {
      }
      this.writer = null;
    }
    if (this.reader) {
      try {
        this.reader.cancel().catch(() => {
        });
        this.reader.releaseLock();
      } catch (_) {
      }
      this.reader = null;
    }
    if (this.socket) {
      try {
        this.socket.close().catch(() => {
        });
      } catch (_) {
      }
      this.socket = null;
    }
    if (notify && !this.session.closed) this.session.sendFrame(frame(3, this.id, EMPTY));
    this.session.onStreamClosed(this.id);
  }
};
var WsSession = class {
  static {
    __name(this, "WsSession");
  }
  constructor(ws, cfg, secret, laneId = 0, connectFn = null) {
    this.laneId = laneId;
    this.laneUsed = false;
    this.ws = ws;
    this.cfg = cfg;
    this.secret = secret;
    this.connectFn = connectFn;
    this.streams = /* @__PURE__ */ new Map();
    this.closed = false;
    this.queued = 0;
    this.tombstones = /* @__PURE__ */ new Set();
    this.tombstoneOrder = [];
    this.chain = Promise.resolve();
    this.lastPong = Date.now();
    this.openedAt = Date.now();
    this.bytesUp = 0;
    this.bytesDown = 0;
    this.streamCount = 0;
    STATS.sessions++;
    STATS.sessionsActive++;
    logEvent("session_open", `lane=${laneId} carrier=${cfg.carrierResolved || cfg.carrier}`);
    this.keepAliveTimer = laneId ? null : setInterval(() => {
      if (this.closed || !this.ws || this.ws.readyState !== 1) {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        return;
      }
      if (Date.now() - this.lastPong > 9e4) {
        this.shutdown("pong watchdog");
        return;
      }
      try {
        const pingPayload = new Uint8Array(4);
        new DataView(pingPayload.buffer).setUint32(0, Math.floor(Date.now() / 1e3), false);
        this.sendFrame(frame(5, 0, pingPayload));
      } catch (_) {
      }
    }, 25e3);
  }
  sendFrame(bytes) {
    if (this.closed) return;
    try {
      this.ws.send(bytes);
      this.bytesDown += bytes.length;
      STATS.bytesDown += bytes.length;
    } catch (_) {
      this.dispose();
    }
  }
  onStreamClosed(id) {
    if (!this.laneId || this.closed || id !== this.laneId) return;
    this.dispose();
    try {
      if (this.ws.readyState === 1) this.ws.close(1e3, "done");
    } catch (_) {
    }
  }
  remember(id) {
    if (this.tombstones.has(id)) return;
    if (this.tombstoneOrder.length === 4096) this.tombstones.delete(this.tombstoneOrder.shift());
    this.tombstones.add(id);
    this.tombstoneOrder.push(id);
  }
  enqueue(data) {
    this.chain = this.chain.then(() => this.handle(data)).catch((e) => {
      if (e && e.name) logEvent("session_err", e.name);
      this.shutdown();
    });
  }
  async handle(data) {
    if (this.closed) return;
    if (!(data instanceof ArrayBuffer)) {
      this.shutdown();
      return;
    }
    const bytes = new Uint8Array(data);
    if (bytes.length === 0 || bytes.length > REQUEST_LIMIT) {
      this.shutdown();
      return;
    }
    this.bytesUp += bytes.length;
    STATS.bytesUp += bytes.length;
    const view = new DataView(data);
    let offset = 0;
    let frames = 0;
    while (offset < bytes.length) {
      if (bytes.length - offset < 8 || ++frames > 4096) {
        this.shutdown();
        return;
      }
      const type = bytes[offset];
      const id = bytes[offset + 1] << 16 | bytes[offset + 2] << 8 | bytes[offset + 3];
      const size = view.getUint32(offset + 4, false);
      const end = offset + 8 + size;
      if (size > 1048576 || end > bytes.length) {
        this.shutdown();
        return;
      }
      const payload = bytes.subarray(offset + 8, end);
      offset = end;
      if (this.laneId && id !== this.laneId) {
        this.shutdown();
        return;
      }
      if (type === 1) {
        if (id === 0 || size !== 0) {
          this.shutdown();
          return;
        }
        if (this.laneId) {
          if (this.laneUsed) {
            this.shutdown();
            return;
          }
          this.laneUsed = true;
          this.streams.set(id, new Stream(this, id));
          continue;
        }
        if (this.streams.has(id) || this.tombstones.has(id) || this.streams.size >= this.cfg.maxStreams) {
          this.sendFrame(frame(3, id, EMPTY));
          continue;
        }
        this.streams.set(id, new Stream(this, id));
      } else if (type === 2) {
        if (id === 0 || size === 0) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.feed(payload);
        else if (!this.tombstones.has(id)) this.sendFrame(frame(3, id, EMPTY));
      } else if (type === 3) {
        if (id === 0 || size !== 0) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.kill(false);
      } else if (type === 4) {
        if (id === 0 || size !== 4) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.addCredit(new DataView(payload.buffer, payload.byteOffset, 4).getUint32(0, false));
      } else if (type === 5) {
        if (id === 0) {
          if (size > 64) {
            this.shutdown();
            return;
          }
          this.sendFrame(frame(6, 0, payload));
        }
      } else if (type === 6) {
        if (id !== 0) {
          this.shutdown();
          return;
        }
        this.lastPong = Date.now();
      } else {
        this.shutdown();
        return;
      }
    }
  }
  dispose() {
    if (this.closed) return;
    this.closed = true;
    STATS.sessionsActive = Math.max(0, STATS.sessionsActive - 1);
    logEvent("session_close", `${fmtDuration(Date.now() - this.openedAt)} streams=${this.streamCount} up=${fmtBytes(this.bytesUp)} down=${fmtBytes(this.bytesDown)}`);
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    for (const stream of Array.from(this.streams.values())) stream.kill(false);
    this.streams.clear();
    this.tombstones.clear();
    this.tombstoneOrder.length = 0;
    this.queued = 0;
  }
  shutdown(reason) {
    logEvent("session_kill", reason || "protocol");
    if (reason === "pong watchdog") maybeAlert(this.cfg, "session_kill", reason);
    this.dispose();
    try {
      if (this.ws.readyState === 1) this.ws.close(1011, "closed");
    } catch (_) {
    }
  }
};

// src/bridge.js
var BRIDGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connection</title>
</head>
<body>
<script nonce="__NONCE__">
(()=>{
'use strict';
const relayBase=location.origin+'/',carrierMode=__CARRIER_MODE__,sessionPath=__SESSION_PATH__,wsPath=__WS_PATH__;
let bootstrap=__BOOTSTRAP__;
const fragment=location.hash,androidNonce=/^#android=([A-Za-z0-9_-]{43})$/.exec(fragment)?.[1]||'';
history.replaceState(null,'',location.pathname);
let initialized=false,closed=false,port=null,sessionToken='',createStarted=false,handshake=null;
let queuedBytes=0,queuedItems=0,pollController=null,webSocket=null,webSocketTimer=0;
const pending=[],upPending=[],lanes=new Map(),closedLanes=new Set(),closedLaneOrder=[];
const queueLimit=33554432,queueItemLimit=16384,closedLaneLimit=4096;
const laneQueueLimit=8388608,laneItemLimit=1024,batchLimit=__BATCH_LIMIT__;
let upSequence=1,downCursor='0',upRunning=false;
let pingTimer=0,reconnectAttempts=0,reconnecting=false,recovering=false;
const openStreams=new Set();
function trackFrames(value,up){
 const view=new DataView(value);let offset=0;
 while(value.byteLength-offset>=8){
  const type=view.getUint8(offset),id=(view.getUint8(offset+1)<<16)|(view.getUint8(offset+2)<<8)|view.getUint8(offset+3);
  if(id){if(up&&type===1)openStreams.add(id);else if(type===3)openStreams.delete(id)}
  offset+=8+view.getUint32(offset+4);
 }
}
function startHeartbeat(){
 if(pingTimer)clearInterval(pingTimer);
 pingTimer=setInterval(()=>{
  if(closed||!webSocket||webSocket.readyState!==WebSocket.OPEN)return;
  try{
   const ping=new Uint8Array(12);
   ping[0]=5;
   const v=new DataView(ping.buffer);
   v.setUint32(4,4);
   v.setUint32(8,Math.floor(Date.now()/1000));
   webSocket.send(ping.buffer);
  }catch(_){}
 },20000);
}
function stopHeartbeat(){
 if(pingTimer){clearInterval(pingTimer);pingTimer=0}
}
const status=state=>{if(port&&!closed)port.postMessage({t:'status',state})};
const pause=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const backoffDelay=attempt=>{const base=Math.min(200*Math.pow(1.5,Math.min(attempt,8)),10000);return base+Math.floor(Math.random()*Math.max(1,base/4))};
// S4: re-fetch this bridge URL to obtain a fresh bootstrap token after the
// previous one expired. Empty string on any failure.
async function refreshBootstrap(){
 try{
  const response=await fetch(location.href,{method:'GET',cache:'no-store',credentials:'omit',mode:'same-origin',redirect:'error',referrerPolicy:'no-referrer'});
  if(!response.ok)return'';
  const match=/bootstrap="([A-Za-z0-9_-]{64})"/.exec(await response.text());
  return match?match[1]:'';
 }catch(_){return''}
}
const options=(method,token,body,headers,signal,keepalive)=>({
 method,body,signal,keepalive:!!keepalive,mode:'same-origin',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',
 headers:Object.assign(token?{Authorization:'Bearer '+token}:{},body?{'Content-Type':'application/octet-stream'}:{},headers||{})
});
const bufferedBytes=()=>{
 let total=webSocket&&webSocket.readyState===WebSocket.OPEN?webSocket.bufferedAmount:0;
 if(carrierMode==='websocket-lanes')for(const lane of lanes.values())if(lane.socket&&lane.socket.readyState===WebSocket.OPEN)total+=lane.socket.bufferedAmount;
 return total;
};
function reserve(data,lane){
 if(!data.byteLength||queuedBytes+bufferedBytes()>queueLimit-data.byteLength||queuedItems>=queueItemLimit)return false;
 if(lane&&(lane.bytes>laneQueueLimit-data.byteLength||lane.items>=laneItemLimit))return false;
 queuedBytes+=data.byteLength;queuedItems++;
 if(lane){lane.bytes+=data.byteLength;lane.items++}
 return true;
}
function release(bytes,items,lane){
 queuedBytes-=bytes;queuedItems-=items;
 if(lane){lane.bytes-=bytes;lane.items-=items}
}
function splitFrames(value){
 const view=new DataView(value),result=[];let offset=0;
 while(offset<value.byteLength){
  if(value.byteLength-offset<8||result.length>=4096)throw new Error('invalid frame batch');
  const type=view.getUint8(offset),id=(view.getUint8(offset+1)<<16)|(view.getUint8(offset+2)<<8)|view.getUint8(offset+3);
  const size=view.getUint32(offset+4),end=offset+8+size;
  if((type===2&&!size)||size>1048576||end>value.byteLength)throw new Error('invalid frame');
  result.push({type,id,data:offset===0&&end===value.byteLength?value:value.slice(offset,end)});offset=end;
 }
 if(!result.length)throw new Error('empty frame batch');
 return result;
}
function frameBound(value,maxFrames,maxBytes){
 const view=new DataView(value);let offset=0,frames=0;
 while(offset<value.byteLength){
  if(value.byteLength-offset<8)throw new Error('invalid frame batch');
  const size=view.getUint32(offset+4),end=offset+8+size;
  if(end>value.byteLength)throw new Error('invalid frame');
  if(frames>0&&(frames>=maxFrames||end>maxBytes))break;
  frames++;offset=end;
 }
 return {frames,bytes:offset};
}
function joinPending(values,lane){
 let total=0,count=0,frames=0;
 while(count<values.length){
  const bound=frameBound(values[count],4096,batchLimit);
  const whole=bound.bytes===values[count].byteLength;
  if(count===0&&!whole){
   const head=new Uint8Array(values[0],0,bound.bytes).slice();
   values[0]=values[0].slice(bound.bytes);
   queuedItems++;if(lane)lane.items++;
   return {body:head.buffer,total:bound.bytes,count:1};
  }
  if(count!==0&&(total+values[count].byteLength>batchLimit||frames+bound.frames>4096))break;
  total+=values[count].byteLength;frames+=bound.frames;count++;
 }
 const joined=new Uint8Array(total);let offset=0;
 for(const data of values.splice(0,count)){joined.set(new Uint8Array(data),offset);offset+=data.byteLength}
 return {body:joined.buffer,total,count};
}
function retryAfterMs(response){
 const header=response.headers.get('Retry-After');
 if(!header)return 0;
 const seconds=Number(header);
 if(Number.isFinite(seconds)&&seconds>=0)return Math.min(seconds*1000,30000);
 const when=Date.parse(header);
 if(Number.isFinite(when)){const delta=when-Date.now();return delta>0?Math.min(delta,30000):0}
 return 0;
}
async function request(path,makeOptions){
 let delay=250,attempt=0;const deadline=Date.now()+90000;
 while(true){
  const requestOptions=makeOptions(),controller=new AbortController();
  const external=requestOptions.signal,abort=()=>controller.abort();
  if(external)external.addEventListener('abort',abort,{once:true});
  requestOptions.signal=controller.signal;
  const timer=setTimeout(abort,90000);
  let wait=0,serviceUnavailable=false;
  try{
   const response=await fetch(relayBase+path,requestOptions);
   if(response.status!==503)return response;
   serviceUnavailable=true;wait=retryAfterMs(response);
   await response.arrayBuffer();
  }catch(error){if(closed||(external&&external.aborted))throw error;attempt++;if(attempt===9)throw new Error('carrier retry limit reached')}
  finally{clearTimeout(timer);if(external)external.removeEventListener('abort',abort)}
  if(serviceUnavailable&&Date.now()>=deadline)throw new Error('carrier retry limit reached');
  status('reconnecting');
  const backoff=wait||(delay+Math.floor(Math.random()*Math.max(1,delay/4)));
  await pause(backoff);
  if(!serviceUnavailable)delay=Math.min(delay*2,5000);
 }
}
function fail(){
 if(closed)return;
 status('failed');
 if(port)port.postMessage({t:'close'});
 close(true);
}
// S4/F5: shared recovery path. The old session (DC sockets + cipher state)
// died server-side; obtain a fresh bootstrap when needed and re-create the
// session with 200 ms jittered exponential retries, 12 attempts max.
function recoverSession(){
 if(closed||recovering)return;
 recovering=true;stopHeartbeat();status('reconnecting');
 for(const id of openStreams){const f=closeFrame(id);port.postMessage(f,[f])}
 openStreams.clear();
 if(upPending.length){let bytes=0;for(const data of upPending)bytes+=data.byteLength;release(bytes,upPending.length,null);upPending.length=0}
 const attempt=i=>{
  if(closed){recovering=false;return}
  if(i>=12){recovering=false;fail();return}
  setTimeout(async()=>{
   if(closed){recovering=false;return}
   try{
    if(i>=1){const fresh=await refreshBootstrap();if(fresh)bootstrap=fresh}
    if(webSocket){try{webSocket.close()}catch(_){}webSocket=null}
    for(const lane of lanes.values()){if(lane.socket)try{lane.socket.close()}catch(_){}}
    sessionToken='';
    await createSession(handshake);
    recovering=false;
   }catch(_){attempt(i+1)}
  },backoffDelay(i));
 };
 attempt(0);
}
async function createSession(first){
 status('connecting');
 const response=await request(sessionPath,()=>options('POST',bootstrap,first));
 if(response.status!==200||response.headers.get('X-Carrier-Mode')!==carrierMode)throw new Error('session creation rejected');
 sessionToken=response.headers.get('X-Session-Token')||'';
 downCursor=response.headers.get('X-Down-Cursor')||'0';
 if(!sessionToken)throw new Error('missing session token');
 if(closed){fetch(relayBase+sessionPath,options('DELETE',sessionToken,null,null,undefined,true)).catch(()=>{});return}
 const welcome=await response.arrayBuffer();
 if(carrierMode==='websocket')await openWebSocket();
 if(closed){fetch(relayBase+sessionPath,options('DELETE',sessionToken,null,null,undefined,true)).catch(()=>{});return}
 port.postMessage(welcome,[welcome]);
 status('connected');
 for(const data of pending.splice(0)){release(data.byteLength,1,null);queueCarrier(data)}
 if(carrierMode==='https')poll();
 else if(carrierMode==='https-lanes')pollLane(ensureLane(0));
}
function queueCarrier(data){
 try{
  if(carrierMode==='https')queueUp(data);
  else if(carrierMode==='https-lanes')for(const value of splitFrames(data))queueLane(value);
  else if(carrierMode==='websocket')queueWebSocket(data);
  else for(const value of splitFrames(data))queueWebSocketLane(value);
 }catch(error){fail()}
}
function queueUp(data){
 if(!reserve(data,null)){fail();return}
 upPending.push(data);runUp();
}
async function runUp(){
 if(upRunning)return;
 upRunning=true;
 try{
  while(!closed&&sessionToken&&upPending.length){
   const batch=joinPending(upPending,null),sequence=String(upSequence);
   const response=await request('api/v1/up',()=>options('POST',sessionToken,batch.body,{'X-Up-Seq':sequence}));
   if(response.status!==204||response.headers.get('X-Up-Ack')!==sequence)throw new Error('uplink rejected');
   release(batch.total,batch.count,null);port.postMessage({t:'traffic',up:batch.total,down:0});upSequence++;
  }
 }catch(error){if(!closed)recoverSession()}
 finally{upRunning=false;if(!closed&&sessionToken&&upPending.length)runUp()}
}
async function poll(){
 while(!closed&&sessionToken){
  try{
   pollController=new AbortController();
   const response=await request('api/v1/down',()=>options('POST',sessionToken,null,{'X-Down-Cursor':downCursor},pollController.signal));
   if(response.status===204){status('connected');continue}
   if(response.status!==200)throw new Error('downlink rejected');
   const next=response.headers.get('X-Down-Cursor')||'',data=await response.arrayBuffer();
   if(!next||!data.byteLength)throw new Error('invalid downlink response');
   if(closed)return;
   port.postMessage({t:'traffic',up:0,down:data.byteLength});port.postMessage(data,[data]);downCursor=next;status('connected');
  }catch(error){if(!closed)recoverSession();return}
 }
}
function ensureLane(id){
 let lane=lanes.get(id);
 if(!lane){lane={id,sequence:1,cursor:'0',pending:[],bytes:0,items:0,running:false,polling:false,socket:null,timer:0,opened:false,localClosed:false,remoteClosed:false,finished:false};lanes.set(id,lane)}
 return lane;
}
function rememberLaneClosed(id){
 if(!id||closedLanes.has(id))return;
 if(closedLaneOrder.length===closedLaneLimit)closedLanes.delete(closedLaneOrder.shift());
 closedLanes.add(id);closedLaneOrder.push(id);
}
function queueLane(value){
 let lane=lanes.get(value.id);
 if(!lane&&(value.type===2||value.type===3||value.type===4))return;
 if(!lane&&closedLanes.has(value.id))throw new Error('closed lane was reused');
 if(!lane&&value.type!==1)throw new Error('lane did not begin with OPEN');
 lane=lane||ensureLane(value.id);
 if(!reserve(value.data,lane)){fail();return}
 lane.pending.push(value.data);runLaneUp(lane);
}
async function runLaneUp(lane){
 if(lane.running)return;
 lane.running=true;
 try{
  while(!closed&&sessionToken&&lane.pending.length){
   const batch=joinPending(lane.pending,lane),sequence=String(lane.sequence),laneID=String(lane.id);
   const response=await request('api/v1/up',()=>options('POST',sessionToken,batch.body,{'X-Up-Seq':sequence,'X-Lane-ID':laneID}));
   if(response.status!==204||response.headers.get('X-Up-Ack')!==sequence)throw new Error('lane uplink rejected');
   release(batch.total,batch.count,lane);port.postMessage({t:'traffic',up:batch.total,down:0});lane.sequence++;
   if(!lane.polling)pollLane(lane);
  }
 }catch(error){if(!closed)recoverSession()}
 finally{lane.running=false;if(!closed&&sessionToken&&lane.pending.length)runLaneUp(lane)}
}
async function pollLane(lane){
 if(lane.polling)return;
 lane.polling=true;
 try{
  while(!closed&&sessionToken&&lanes.get(lane.id)===lane){
   const controller=new AbortController(),laneID=String(lane.id);
   lane.controller=controller;
   const response=await request('api/v1/down',()=>options('POST',sessionToken,null,{'X-Down-Cursor':lane.cursor,'X-Lane-ID':laneID},controller.signal));
   if(response.status===204){
    if(response.headers.get('X-Lane-Closed')==='1'){lanes.delete(lane.id);rememberLaneClosed(lane.id);return}
    status('connected');continue;
   }
   if(response.status!==200)throw new Error('lane downlink rejected');
   const next=response.headers.get('X-Down-Cursor')||'',data=await response.arrayBuffer();
   if(!next||!data.byteLength)throw new Error('invalid lane downlink response');
   for(const value of splitFrames(data))if(value.id!==lane.id)throw new Error('cross-lane frame');
   if(closed)return;
   port.postMessage({t:'traffic',up:0,down:data.byteLength});port.postMessage(data,[data]);lane.cursor=next;status('connected');
  }
 }catch(error){if(!closed)recoverSession()}
 finally{lane.polling=false;lane.controller=null}
}
function openWebSocket(){
 return new Promise((resolve,reject)=>{
  const target=relayBase.replace(/^https:/,'wss:')+wsPath,socket=new WebSocket(target,'tproxy-v1.'+sessionToken);
  webSocket=socket;socket.binaryType='arraybuffer';
  let opened=false;
  socket.onopen=()=>{
   opened=true;
   startHeartbeat();
   resolve();
  };
  socket.onmessage=event=>{
   if(!(event.data instanceof ArrayBuffer)||!event.data.byteLength){fail();return}
   if(event.data.byteLength>=8){
    const view=new DataView(event.data);
    const type=view.getUint8(0);
    const id=(view.getUint8(1)<<16)|(view.getUint8(2)<<8)|view.getUint8(3);
    if(id===0){
     if(type===5){
      const pong=new Uint8Array(event.data.slice(0));
      pong[0]=6;
      if(socket.readyState===WebSocket.OPEN)try{socket.send(pong.buffer)}catch(_){}
      return;
     }
     if(type===6)return;
    }
   }
   try{trackFrames(event.data,false)}catch(_){}
   port.postMessage({t:'traffic',up:0,down:event.data.byteLength});port.postMessage(event.data,[event.data]);status('connected');
  };
  socket.onerror=()=>reject(new Error('websocket failed'));
  socket.onclose=()=>{
   if(closed||webSocket!==socket||!opened)return;
   scheduleReconnect();
  };
 });
}
function scheduleReconnect(){
 if(closed||reconnecting)return;
 reconnecting=true;stopHeartbeat();status('reconnecting');
 // The server-side session (DC sockets + cipher state) died with the old
 // socket. Close those streams towards Telegram so it reopens them at once
 // instead of hanging, and drop uplink bytes that belong to the dead streams.
 for(const id of openStreams){const f=closeFrame(id);port.postMessage(f,[f])}
 openStreams.clear();
 if(upPending.length){let bytes=0;for(const data of upPending)bytes+=data.byteLength;release(bytes,upPending.length,null);upPending.length=0}
 const attempt=()=>{
  if(closed)return;
  if(reconnectAttempts>=12){fail();return}
  reconnectAttempts++;
  setTimeout(()=>{
   if(closed)return;
   openWebSocket().then(()=>{reconnecting=false;reconnectAttempts=0;status('connected');runWebSocketUp()}).catch(()=>{
    // After two direct retries assume the session token itself is dead and
    // recover with a fresh bootstrap + new session (S4).
    if(reconnectAttempts>=2){reconnecting=false;recoverSession()}
    else attempt();
   });
  },backoffDelay(reconnectAttempts-1));
 };
 attempt();
}
function queueWebSocket(data){
 trackFrames(data,true);
 if(!reserve(data,null)){fail();return}
 upPending.push(data);runWebSocketUp();
}
function runWebSocketUp(){
 if(closed||!webSocket||webSocket.readyState!==WebSocket.OPEN||!upPending.length)return;
 if(webSocket.bufferedAmount+queuedBytes>queueLimit||webSocket.bufferedAmount>=batchLimit){
  if(!webSocketTimer)webSocketTimer=setTimeout(()=>{webSocketTimer=0;runWebSocketUp()},10);
  return;
 }
 try{
  const batch=joinPending(upPending,null);webSocket.send(batch.body);release(batch.total,batch.count,null);
  port.postMessage({t:'traffic',up:batch.total,down:0});
  if(upPending.length)queueMicrotask(runWebSocketUp);
 }catch(error){fail()}
}
function closeFrame(id){
 const data=new ArrayBuffer(8),view=new DataView(data);
 view.setUint8(0,3);view.setUint8(1,id>>>16);view.setUint8(2,id>>>8);view.setUint8(3,id);view.setUint32(4,0);
 return data;
}
function finishWebSocketLane(lane,notify){
 if(lane.finished||lanes.get(lane.id)!==lane)return;
 lane.finished=true;if(lane.timer)clearTimeout(lane.timer);
 if(lane.bytes||lane.items)release(lane.bytes,lane.items,lane);
 lane.pending.length=0;lanes.delete(lane.id);rememberLaneClosed(lane.id);
 if(lane.socket&&(lane.socket.readyState===WebSocket.OPEN||lane.socket.readyState===WebSocket.CONNECTING))try{lane.socket.close()}catch(error){}
 if(notify&&port&&!closed){const f=closeFrame(lane.id);port.postMessage(f,[f])}
}
function openWebSocketLane(lane){
 const target=relayBase.replace(/^https:/,'wss:')+wsPath;
 const socket=new WebSocket(target,'tproxy-lane-v1.'+sessionToken+'.'+lane.id);
 lane.socket=socket;socket.binaryType='arraybuffer';
 socket.onopen=()=>{if(closed||lane.finished){socket.close();return}lane.opened=true;status('connected');runWebSocketLaneUp(lane)};
 socket.onmessage=event=>{
  if(!(event.data instanceof ArrayBuffer)||!event.data.byteLength){fail();return}
  let values;try{values=splitFrames(event.data)}catch(error){fail();return}
  if(values.some(value=>value.id!==lane.id)){fail();return}
  if(values.some(value=>value.type===3))lane.remoteClosed=true;
  port.postMessage({t:'traffic',up:0,down:event.data.byteLength});port.postMessage(event.data,[event.data]);status('connected');
 };
 socket.onerror=()=>{};
 socket.onclose=()=>{
  if(closed||lane.finished)return;
  if(!lane.opened){recoverSession();return}
  finishWebSocketLane(lane,!lane.localClosed&&!lane.remoteClosed);
 };
}
function queueWebSocketLane(value){
 let lane=lanes.get(value.id);
 if(!lane&&(value.type===2||value.type===3||value.type===4))return;
 if(!value.id||(!lane&&closedLanes.has(value.id)))throw new Error('closed lane was reused');
 if(!lane&&value.type!==1)throw new Error('lane did not begin with OPEN');
 lane=lane||ensureLane(value.id);
 if(value.type===3&&!lane.opened){finishWebSocketLane(lane,false);return}
 if(!reserve(value.data,lane)){fail();return}
 lane.pending.push(value.data);if(value.type===3)lane.localClosed=true;
 if(!lane.socket)openWebSocketLane(lane);else runWebSocketLaneUp(lane);
}
function runWebSocketLaneUp(lane){
 const socket=lane.socket;
 if(closed||lane.finished||!socket||socket.readyState!==WebSocket.OPEN||!lane.pending.length)return;
 if(socket.bufferedAmount>=batchLimit){
  if(!lane.timer)lane.timer=setTimeout(()=>{lane.timer=0;runWebSocketLaneUp(lane)},10);
  return;
 }
 try{
  const batch=joinPending(lane.pending,lane);socket.send(batch.body);release(batch.total,batch.count,lane);
  port.postMessage({t:'traffic',up:batch.total,down:0});
  if(lane.pending.length)queueMicrotask(()=>runWebSocketLaneUp(lane));
 }catch(error){fail()}
}
function close(notifyServer){
 if(closed)return;
 closed=true;
 stopHeartbeat();
 if(pollController)pollController.abort();
 for(const lane of lanes.values()){
  if(lane.controller)lane.controller.abort();
  if(lane.timer)clearTimeout(lane.timer);
  if(lane.socket)try{lane.socket.close()}catch(error){}
 }
 if(webSocketTimer)clearTimeout(webSocketTimer);
 if(webSocket)webSocket.close();
 if(notifyServer&&sessionToken)fetch(relayBase+sessionPath,options('DELETE',sessionToken,null,null,undefined,true)).catch(()=>{});
 if(port)port.close();
}
function activatePort(nextPort){
 initialized=true;port=nextPort;
 port.onmessage=message=>{
  if(message.data instanceof ArrayBuffer){
   if(!createStarted){createStarted=true;handshake=message.data;createSession(handshake).catch(()=>recoverSession())}
   else if(!sessionToken){if(!reserve(message.data,null)){fail();return}pending.push(message.data)}
   else queueCarrier(message.data);
  }else if(message.data&&message.data.t==='close')close(true);
 };
 port.start();status('connecting');
}
addEventListener('message',event=>{
 if(initialized||event.source!==parent||event.data===null||typeof event.data!=='object')return;
 const keys=Object.keys(event.data).sort();
 if(keys.length!==2||keys[0]!=='t'||keys[1]!=='v'||event.data.t!=='tproxy-init'||event.data.v!==1||event.ports.length!==1)return;
 let source;try{source=new URL(event.origin)}catch(error){return}
 if(source.protocol!=='http:'||source.hostname!=='127.0.0.1'||!source.port||source.origin!==event.origin)return;
 activatePort(event.ports[0]);
},{once:false});
const androidBridge=globalThis.TelegramWebProxy;
if(!initialized&&androidNonce&&androidBridge&&typeof androidBridge.postMessage==='function'){
 const androidPort={onmessage:null,start(){},close(){androidBridge.onmessage=null},postMessage(value){
  if(value instanceof ArrayBuffer){
   let frames;try{frames=splitFrames(value)}catch(error){fail();return}
   for(const f of frames)androidBridge.postMessage(f.data);
  }else androidBridge.postMessage(JSON.stringify(value));
 }};
 androidBridge.onmessage=event=>{
  let data=event.data;if(typeof data==='string'){try{data=JSON.parse(data)}catch(error){return}}
  if(androidPort.onmessage)androidPort.onmessage({data});
 };
 activatePort(androidPort);androidBridge.postMessage(JSON.stringify({t:'tproxy-android-init',v:1,nonce:androidNonce}));
}
addEventListener('pagehide',()=>close(true),{once:true});
})();
<\/script>
</body>
</html>
`;
function serveBridge(cfg, host, mode, port, nonce, bootstrapToken, carrierResolved) {
  const body = BRIDGE_HTML.replaceAll("__NONCE__", () => nonce).replaceAll("__BOOTSTRAP__", () => JSON.stringify(bootstrapToken)).replaceAll("__CARRIER_MODE__", () => JSON.stringify(carrierResolved)).replaceAll("__BATCH_LIMIT__", () => String(cfg.batchBytes)).replaceAll("__SESSION_PATH__", () => JSON.stringify(cfg.sessionPath.replace(/^\//, ""))).replaceAll("__WS_PATH__", () => JSON.stringify(cfg.wsPath.replace(/^\//, "")));
  const csp = [
    "default-src 'none'",
    "base-uri 'none'",
    "child-src 'none'",
    "connect-src 'self' https://" + host + ":* wss://" + host + ":* https://" + host + " wss://" + host,
    "font-src 'none'",
    "form-action 'none'",
    "frame-ancestors http://127.0.0.1:*",
    "frame-src 'none'",
    "img-src 'none'",
    "manifest-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "script-src 'nonce-" + nonce + "'",
    "style-src 'none'",
    "worker-src 'none'",
    "sandbox allow-same-origin allow-scripts"
  ].join("; ");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": csp,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-DNS-Prefetch-Control": "off",
      "Permissions-Policy": PERMISSIONS_POLICY
    }
  });
}
__name(serveBridge, "serveBridge");

// src/qr.js
var import_qrcode_generator = __toESM(require_qrcode(), 1);
function qrSvg(text) {
  try {
    const qr = (0, import_qrcode_generator.default)(0, "M");
    qr.addData(String(text));
    qr.make();
    return qr.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
  } catch (_) {
    return "";
  }
}
__name(qrSvg, "qrSvg");

// src/pages.js
var PAGE_STYLE = "body{font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;max-width:760px;margin:0 auto;padding:16px;background:#f6f7f9;color:#1d2330;line-height:1.8}h1{font-size:21px;margin:8px 0 4px}h2{font-size:16px;margin-top:28px}.card{background:#fff;border-radius:12px;padding:12px 16px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}a.btn{display:block;text-align:center;background:#2a9df4;color:#fff;text-decoration:none;padding:10px;border-radius:10px;margin:6px 0;font-weight:bold}code,textarea{direction:ltr;text-align:left;font-family:ui-monospace,Consolas,monospace;font-size:12px}textarea{width:100%;height:58px;box-sizing:border-box;border:1px solid #ccd;border-radius:8px;padding:6px}textarea.one{height:34px}.muted{color:#667;font-size:13px}.warn{background:#fff4e5;border-inline-start:4px solid #f0a020}.bad{background:#fdecea;border-inline-start:4px solid #d84a3f}footer.credit{margin:32px 0 8px;text-align:center;font-size:12px;color:#889;direction:ltr}footer.credit a{color:#667}ol{padding-inline-start:22px;margin:4px 0}nav.lang{text-align:end;font-size:14px}nav.lang label{cursor:pointer;padding:4px 10px;border-radius:8px;color:#2a6fd6}.fa{display:none}#l-fa:checked~main{direction:rtl;font-family:Tahoma,system-ui,sans-serif}#l-fa:checked~main .en{display:none}#l-fa:checked~main span.fa{display:inline}#l-fa:checked~main div.fa,#l-fa:checked~main p.fa,#l-fa:checked~main ol.fa,#l-fa:checked~main h1.fa,#l-fa:checked~main h2.fa{display:block}#l-en:checked~main nav label[for=l-en],#l-fa:checked~main nav label[for=l-fa]{background:#e3eefc;font-weight:bold}pre{background:#f0f2f5;padding:8px;border-radius:8px;overflow-x:auto;font-size:11px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:start;vertical-align:top}th{font-weight:600;white-space:nowrap}.ok{color:#177245}.badc{color:#b33}a.plain{color:#2a6fd6}button.copy{cursor:pointer;border:1px solid #ccd;background:#eef2ff;border-radius:8px;padding:4px 12px;font-size:12px}details.qr{margin:6px 0}details.qr svg{width:160px;height:160px;background:#fff;border:1px solid #e5e7eb;border-radius:8px}";
function bi(en, fa) {
  return `<span class="en">${en}</span><span class="fa">${fa}</span>`;
}
__name(bi, "bi");
function bilingualPage(title, lang, body, nonce, extraScript = "") {
  const fa = lang === "fa";
  const credit = `<footer class="credit">ProxyGosha &middot; ${escapeHtml(CREDIT_NAME)} &middot; <a href="mailto:${escapeHtml(CREDIT_MAIL)}">${escapeHtml(CREDIT_MAIL)}</a></footer>`;
  const script = extraScript ? `<script nonce="${escapeHtml(nonce)}">${extraScript}<\/script>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${PAGE_STYLE}</style></head><body>
<input type="radio" name="l" id="l-en" hidden${fa ? "" : " checked"}><input type="radio" name="l" id="l-fa" hidden${fa ? " checked" : ""}>
<main><nav class="lang"><label for="l-en">English</label> <label for="l-fa">\u0641\u0627\u0631\u0633\u06CC</label></nav>
${body}
${credit}
</main>${script}</body></html>`;
}
__name(bilingualPage, "bilingualPage");
function pageHeaders(nonce) {
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "script-src 'nonce-" + nonce + "'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
    "img-src 'self'"
  ].join("; ");
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": csp
  };
}
__name(pageHeaders, "pageHeaders");
var COPY_SCRIPT = `document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var t=b.getAttribute('data-copy');function done(){var o=b.textContent;b.textContent=b.getAttribute('data-done')||'Copied';setTimeout(function(){b.textContent=o},1200)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t,done)})}else fallback(t,done);function fallback(t,cb){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');cb()}catch(e){}document.body.removeChild(a)}});`;
function serveSetup(cfg, host, lang, method, nonce, suggestions) {
  if (method !== "GET" && method !== "HEAD") return null;
  const { adminKey, secret } = suggestions;
  const secretState = cfg && !cfg.secretDerived ? `<div class="card ok">${bi(
    "SECRET is already configured on this worker \u2014 its value is never shown here. The suggestion below is a fresh random value you can ignore.",
    "SECRET \u0631\u0648\u06CC \u0627\u06CC\u0646 \u0648\u0631\u06A9\u0631 \u0627\u0632 \u0642\u0628\u0644 \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2014 \u0645\u0642\u062F\u0627\u0631\u0634 \u0627\u06CC\u0646\u062C\u0627 \u0647\u0631\u06AF\u0632 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0645\u0642\u062F\u0627\u0631 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u0632\u06CC\u0631 \u062A\u0635\u0627\u062F\u0641\u06CC \u062C\u062F\u06CC\u062F \u0627\u0633\u062A \u0648 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0646\u0627\u062F\u06CC\u062F\u0647 \u0628\u06AF\u06CC\u0631\u06CC\u062F."
  )}</div>` : "";
  const legacyNote = cfg && cfg.secretDerived ? `<div class="card warn">${bi(
    "You are in legacy mode: secrets are derived from ADMIN_KEY. Generate a SECRET below and set it to freeze your current links, then rotate ADMIN_KEY safely.",
    "\u0634\u0645\u0627 \u062F\u0631 \u062D\u0627\u0644\u062A \u0642\u062F\u06CC\u0645\u06CC \u0647\u0633\u062A\u06CC\u062F: \u0633\u06A9\u0631\u062A\u200C\u0647\u0627 \u0627\u0632 ADMIN_KEY \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u06CC\u06A9 SECRET \u0627\u0632 \u0632\u06CC\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F \u0648 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u062B\u0627\u0628\u062A \u0628\u0645\u0627\u0646\u0646\u062F\u060C \u0628\u0639\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F ADMIN_KEY \u0631\u0627 \u0639\u0648\u0636 \u06A9\u0646\u06CC\u062F."
  )}</div>` : "";
  const body = `<h1>${bi("Proxy setup", "\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC")}</h1>${secretState}${legacyNote}
<div class="card">
<ol class="en"><li>In the Cloudflare dashboard, open <b>Workers &amp; Pages</b> \u2192 this Worker \u2192 <b>Settings</b> \u2192 <b>Variables and Secrets</b>.</li>
<li>Add <code>ADMIN_KEY</code> with the admin key below (24+ mixed characters recommended).</li>
<li>Add <code>SECRET</code> with the 32-hex secret below. This decouples your proxy secrets from ADMIN_KEY.</li>
<li>(Optional, for mass token revocation) Add <code>KEY_EPOCH</code>, e.g. <code>1</code>. Changing it instantly invalidates all issued carrier tokens.</li>
<li>Click <b>Deploy</b>, then open the panel address below.</li></ol>
<ol class="fa"><li>\u062F\u0631 \u062F\u0627\u0634\u0628\u0648\u0631\u062F \u06A9\u0644\u0648\u062F\u0641\u0644\u0631: <b>Workers &amp; Pages</b> \u2190 \u0627\u06CC\u0646 \u0648\u0631\u06A9\u0631 \u2190 <b>Settings</b> \u2190 <b>Variables and Secrets</b></li>
<li>\u0645\u062A\u063A\u06CC\u0631 <code>ADMIN_KEY</code> \u0631\u0627 \u0628\u0627 \u06A9\u0644\u06CC\u062F \u0632\u06CC\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F (\u062A\u0631\u06A9\u06CC\u0628 \u06F2\u06F4+ \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u062A\u0648\u0635\u06CC\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F).</li>
<li>\u0645\u062A\u063A\u06CC\u0631 <code>SECRET</code> \u0631\u0627 \u0628\u0627 \u0645\u0642\u062F\u0627\u0631 \u06F3\u06F2 \u062D\u0631\u0641\u06CC hex \u0632\u06CC\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F. \u0628\u0627 \u0627\u06CC\u0646 \u06A9\u0627\u0631 \u0633\u06A9\u0631\u062A\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u0627\u0632 ADMIN_KEY \u0645\u0633\u062A\u0642\u0644 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.</li>
<li>(\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC\u060C \u0628\u0631\u0627\u06CC \u0627\u0628\u0637\u0627\u0644 \u062A\u0648\u06A9\u0646\u200C\u0647\u0627) \u0645\u062A\u063A\u06CC\u0631 <code>KEY_EPOCH</code> \u0631\u0627 \u0645\u062B\u0644\u0627\u064B <code>1</code> \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F. \u062A\u063A\u06CC\u06CC\u0631 \u0622\u0646 \u0647\u0645\u0647 \u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC \u0635\u0627\u062F\u0631\u0634\u062F\u0647 \u0631\u0627 \u0628\u0627\u0637\u0644 \u0645\u06CC\u200C\u06A9\u0646\u062F.</li>
<li><b>Deploy</b> \u0631\u0627 \u0628\u0632\u0646\u06CC\u062F \u0648 \u0633\u067E\u0633 \u0622\u062F\u0631\u0633 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0627\u0632 \u06A9\u0646\u06CC\u062F.</li></ol>
${bi("Suggested ADMIN_KEY", "ADMIN_KEY \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC")}:<textarea class="one" readonly>${escapeHtml(adminKey)}</textarea>
${bi("Suggested SECRET (paste as-is)", "SECRET \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC (\u0647\u0645\u06CC\u0646 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0646\u06CC\u062F)")}:<textarea class="one" readonly>${escapeHtml(secret)}</textarea>
${bi("Login page", "\u0635\u0641\u062D\u0647 \u0648\u0631\u0648\u062F")}:<textarea class="one" readonly>https://${escapeHtml(host)}/login</textarea></div>
<p class="muted">${bi(
    "Keep ADMIN_KEY private; it unlocks the panel. SECRET is the actual proxy secret \u2014 treat it as the sensitive one. Do not share the panel address with users.",
    "ADMIN_KEY \u0631\u0627 \u062E\u0635\u0648\u0635\u06CC \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u061B \u06A9\u0644\u06CC\u062F \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0627\u0633\u062A. SECRET \u0633\u06A9\u0631\u062A \u0648\u0627\u0642\u0639\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u0627\u0633\u062A \u2014 \u062D\u0633\u0627\u0633\u200C\u062A\u0631 \u0627\u0633\u062A. \u0622\u062F\u0631\u0633 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0627 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0646\u06AF\u0630\u0627\u0631\u06CC\u062F."
  )}</p>`;
  return new Response(bilingualPage("Setup", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}
__name(serveSetup, "serveSetup");
function serveLogin(cfg, host, lang, nonce, error = "") {
  const body = `<h1>${bi("Panel sign-in", "\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644")}</h1>
${error ? `<div class="card bad">${bi("Wrong key.", "\u06A9\u0644\u06CC\u062F \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A.")}</div>` : ""}
<div class="card">
<form method="post" action="/login">
${bi("ADMIN_KEY", "\u06A9\u0644\u06CC\u062F \u0645\u062F\u06CC\u0631")}: <input type="password" name="key" autocomplete="current-password" style="width:100%;padding:8px;border:1px solid #ccd;border-radius:8px" required>
<button type="submit" style="margin-top:8px;padding:8px 18px;border-radius:8px;background:#2a9df4;color:#fff;border:0;cursor:pointer">${bi("Sign in", "\u0648\u0631\u0648\u062F")}</button>
</form></div>
<p class="muted">${bi(
    "Cookie-based sign-in (HttpOnly, Secure, SameSite=Strict). Putting the key in the URL still works but is deprecated: it leaks into browser history and server logs.",
    "\u0648\u0631\u0648\u062F \u0645\u0628\u062A\u0646\u06CC \u0628\u0631 \u06A9\u0648\u06A9\u06CC (HttpOnly\u060C Secure\u060C SameSite=Strict). \u0642\u0631\u0627\u0631 \u062F\u0627\u062F\u0646 \u06A9\u0644\u06CC\u062F \u062F\u0631 \u0622\u062F\u0631\u0633 \u0647\u0646\u0648\u0632 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0627\u0645\u0627 \u0645\u0646\u0633\u0648\u062E \u0627\u0633\u062A: \u062F\u0631 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0648 \u0644\u0627\u06AF\u200C\u0647\u0627 \u0628\u0627\u0642\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F."
  )}</p>`;
  return new Response(bilingualPage("Sign in", lang, body, nonce), { status: error ? 401 : 200, headers: pageHeaders(nonce) });
}
__name(serveLogin, "serveLogin");
async function servePanel(cfg, host, port, lang, nonce, via) {
  STATS.panelViews++;
  logEvent("panel_view", host);
  const statusHref = "/panel/status";
  const secret = cfg.baseHex;
  const deprecated = via === "url" ? `<div class="card warn">${bi(
    "You opened the panel with the key in the URL. This still works but is deprecated \u2014 use the login page instead so the key never lands in browser history or logs.",
    "\u067E\u0646\u0644 \u0631\u0627 \u0628\u0627 \u06A9\u0644\u06CC\u062F \u062F\u0627\u062E\u0644 \u0622\u062F\u0631\u0633 \u0628\u0627\u0632 \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F. \u0627\u06CC\u0646 \u0631\u0648\u0634 \u0647\u0646\u0648\u0632 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0627\u0645\u0627 \u0645\u0646\u0633\u0648\u062E \u0627\u0633\u062A \u2014 \u0628\u0647\u200C\u062C\u0627\u06CC \u0622\u0646 \u0627\u0632 \u0635\u0641\u062D\u0647 \u0648\u0631\u0648\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u06A9\u0644\u06CC\u062F \u062F\u0631 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u0648 \u0644\u0627\u06AF\u200C\u0647\u0627 \u062B\u0628\u062A \u0646\u0634\u0648\u062F."
  )}</div>` : "";
  const legacyWarn = cfg.secretDerived ? `<div class="card warn"><b>${bi("Legacy secret mode", "\u062D\u0627\u0644\u062A \u0642\u062F\u06CC\u0645\u06CC \u0633\u06A9\u0631\u062A")}</b> \u2014 ${bi(
    "Your proxy secrets are derived from ADMIN_KEY. A weak ADMIN_KEY can be brute-forced offline because the secret is shared with every user. To freeze your current links and decouple: set the SECRET variable below to this exact value, then you may rotate ADMIN_KEY freely:",
    "\u0633\u06A9\u0631\u062A\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u0634\u0645\u0627 \u0627\u0632 ADMIN_KEY \u0645\u0634\u062A\u0642 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u06CC\u06A9 ADMIN_KEY \u0636\u0639\u06CC\u0641 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0622\u0641\u0644\u0627\u06CC\u0646 brute-force \u0634\u0648\u062F \u0686\u0648\u0646 \u0633\u06A9\u0631\u062A \u0628\u0627 \u0647\u0645\u0647 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0645\u0634\u062A\u0631\u06A9 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u062B\u0627\u0628\u062A \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0646 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627 \u0648 \u0645\u0633\u062A\u0642\u0644 \u06A9\u0631\u062F\u0646 \u0622\u0646\u200C\u0647\u0627\u060C \u0645\u062A\u063A\u06CC\u0631 SECRET \u0631\u0627 \u062F\u0642\u06CC\u0642\u0627\u064B \u0628\u0631\u0627\u0628\u0631 \u0627\u06CC\u0646 \u0645\u0642\u062F\u0627\u0631 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F\u060C \u0628\u0639\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F ADMIN_KEY \u0631\u0627 \u0639\u0648\u0636 \u06A9\u0646\u06CC\u062F:"
  )}<textarea class="one" readonly>${escapeHtml(secret)}</textarea></div>` : "";
  const adminWarn = cfg.adminIssues.length ? `<div class="card bad"><b>${bi("ADMIN_KEY weakness", "\u0636\u0639\u0641 ADMIN_KEY")}</b><ul style="margin:4px 22px">${cfg.adminIssues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>${bi(
    "Use a longer, mixed-character key. Set a fixed SECRET first so changing ADMIN_KEY does not break links.",
    "\u0627\u0632 \u06A9\u0644\u06CC\u062F \u0637\u0648\u0644\u0627\u0646\u06CC\u200C\u062A\u0631 \u0628\u0627 \u062A\u0631\u06A9\u06CC\u0628 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F. \u0627\u0648\u0644 SECRET \u062B\u0627\u0628\u062A \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u062A\u063A\u06CC\u06CC\u0631 ADMIN_KEY \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627 \u0631\u0627 \u0646\u0634\u06A9\u0646\u062F."
  )}</div>` : "";
  const userSection = cfg.userSecrets.length ? `<h2>${bi("Per-user links", "\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646")}</h2><div class="card muted">${bi(
    "Each user gets a unique secret derived from their label. The secret works on every port. Revoke one by removing its label from the USER_SECRETS environment variable and redeploying; revocation applies to new connections. Session counters are per-isolate and reset on recycle.",
    "\u0647\u0631 \u06A9\u0627\u0631\u0628\u0631 \u0633\u06A9\u0631\u062A \u06CC\u06A9\u062A\u0627\u06CC \u0645\u0634\u062A\u0642\u200C\u0634\u062F\u0647 \u0627\u0632 \u0628\u0631\u0686\u0633\u0628 \u062E\u0648\u062F\u0634 \u0631\u0627 \u062F\u0627\u0631\u062F. \u0627\u06CC\u0646 \u0633\u06A9\u0631\u062A \u0631\u0648\u06CC \u0647\u0645\u0647 \u067E\u0648\u0631\u062A\u200C\u0647\u0627 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0628\u0631\u0627\u06CC \u0627\u0628\u0637\u0627\u0644\u060C \u0628\u0631\u0686\u0633\u0628 \u0631\u0627 \u0627\u0632 \u0645\u062A\u063A\u06CC\u0631 USER_SECRETS \u062D\u0630\u0641 \u06A9\u0646\u06CC\u062F \u0648 \u062F\u0648\u0628\u0627\u0631\u0647 \u062F\u06CC\u067E\u0644\u0648\u06CC \u06A9\u0646\u06CC\u062F\u061B \u0627\u0628\u0637\u0627\u0644 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644\u200C\u0647\u0627\u06CC \u062C\u062F\u06CC\u062F \u0627\u0639\u0645\u0627\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0634\u0645\u0627\u0631\u0646\u062F\u0647 \u0646\u0634\u0633\u062A\u200C\u0647\u0627 \u0645\u062E\u0635\u0648\u0635 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647 \u0627\u0633\u062A \u0648 \u0628\u0627 \u0628\u0627\u0632\u06CC\u0627\u0641\u062A \u0635\u0641\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F."
  )}</div>${cfg.userSecrets.map((u) => {
    const link = "tg://webproxy?server=" + encodeURIComponent(host) + "&secret=" + u.secretHex;
    const count = USER_SESSIONS[u.label] || 0;
    return `<div class="card"><b>${escapeHtml(u.label)}</b> <span class="muted">${bi("sessions (this isolate)", "\u0646\u0634\u0633\u062A\u200C\u0647\u0627 (\u0627\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647)")}: ${count}</span><a class="btn" href="${escapeHtml(link)}">${bi("Connect in Telegram", "\u0627\u062A\u0635\u0627\u0644 \u062F\u0631 \u062A\u0644\u06AF\u0631\u0627\u0645")}</a><textarea readonly>${escapeHtml(link)}</textarea><button class="copy" type="button" data-copy="${escapeHtml(u.secretHex)}" data-done="${bi("Copied", "\u06A9\u067E\u06CC \u0634\u062F")}">${bi("Copy secret", "\u06A9\u067E\u06CC \u0633\u06A9\u0631\u062A")}</button><details class="qr"><summary>${bi("QR code", "\u06A9\u062F QR")}</summary>${qrSvg(link)}</details></div>`;
  }).join("")}` : "";
  const hosts = [];
  for (const h of [host, ...cfg.extraHosts || []]) if (h && !hosts.includes(h)) hosts.push(h);
  const sections = hosts.map((h) => {
    const workersDev = h.endsWith(".workers.dev");
    const items = HTTPS_PORTS.map((p) => {
      const pSecret = cfg.portSecrets?.[p]?.secretHex || secret;
      const link = "tg://webproxy?server=" + encodeURIComponent(h) + (p !== 443 ? "&port=" + p : "") + "&secret=" + pSecret;
      return `<div class="card"><b>${bi("Port", "\u067E\u0648\u0631\u062A")} ${p}</b>${p === 443 ? " " + bi("(default)", "(\u067E\u06CC\u0634\u200C\u0641\u0631\u0636)") : ""}<a class="btn" href="${escapeHtml(link)}">${bi("Connect in Telegram", "\u0627\u062A\u0635\u0627\u0644 \u062F\u0631 \u062A\u0644\u06AF\u0631\u0627\u0645")}</a><textarea readonly>${escapeHtml(link)}</textarea><button class="copy" type="button" data-copy="${escapeHtml(link)}" data-done="${bi("Copied", "\u06A9\u067E\u06CC \u0634\u062F")}">${bi("Copy link", "\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9")}</button> <button class="copy" type="button" data-copy="${escapeHtml(pSecret)}" data-done="${bi("Copied", "\u06A9\u067E\u06CC \u0634\u062F")}">${bi("Copy secret", "\u06A9\u067E\u06CC \u0633\u06A9\u0631\u062A")}</button><details class="qr"><summary>${bi("QR code", "\u06A9\u062F QR")}</summary>${qrSvg(link)}</details></div>`;
    }).join("");
    const note = workersDev ? `<div class="card bad"><b>${bi("workers.dev addresses are usually blocked", "\u0622\u062F\u0631\u0633\u200C\u0647\u0627\u06CC workers.dev \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0641\u06CC\u0644\u062A\u0631\u0646\u062F")}</b> \u2014 ${bi(
      "they are filtered in Iran and many other regions and some ports may not open. Attach a custom domain to this Worker for reliable service.",
      "\u062F\u0631 \u0627\u06CC\u0631\u0627\u0646 \u0648 \u062E\u06CC\u0644\u06CC \u0627\u0632 \u06A9\u0634\u0648\u0631\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u0641\u06CC\u0644\u062A\u0631 \u0647\u0633\u062A\u0646\u062F \u0648 \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0628\u0639\u0636\u06CC \u067E\u0648\u0631\u062A\u200C\u0647\u0627 \u0628\u0627\u0632 \u0646\u0634\u0648\u0646\u062F. \u0628\u0631\u0627\u06CC \u0633\u0631\u0648\u06CC\u0633 \u067E\u0627\u06CC\u062F\u0627\u0631 \u06CC\u06A9 \u062F\u0627\u0645\u0646\u0647 \u0634\u062E\u0635\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u0648\u0631\u06A9\u0631 \u0648\u0635\u0644 \u06A9\u0646\u06CC\u062F."
    )}</div>` : "";
    const manualItems = HTTPS_PORTS.map((p) => {
      const s = cfg.portSecrets?.[p]?.secretHex || secret;
      return `<div style="margin:6px 0"><b>${bi("Port", "\u067E\u0648\u0631\u062A")} ${p}</b>${p === 443 ? " " + bi("(default)", "(\u067E\u06CC\u0634\u200C\u0641\u0631\u0636)") : ""}:<textarea class="one" readonly>${escapeHtml(s)}</textarea></div>`;
    }).join("");
    const manual = `<div class="card"><b>${bi("Manual entry", "\u0648\u0631\u0648\u062F \u062F\u0633\u062A\u06CC")}</b> \u2014 ${bi(
      "in Telegram's proxy settings, add a new proxy of type <b>WEB</b>. Each port accepts ONLY its own secret:",
      "\u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC \u062A\u0644\u06AF\u0631\u0627\u0645 \u06CC\u06A9 \u067E\u0631\u0648\u06A9\u0633\u06CC \u062C\u062F\u06CC\u062F \u0627\u0632 \u0646\u0648\u0639 <b>WEB</b> \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F. \u0647\u0631 \u067E\u0648\u0631\u062A \u0641\u0642\u0637 \u0633\u06A9\u0631\u062A \u062E\u0648\u062F\u0634 \u0631\u0627 \u0645\u06CC\u200C\u067E\u0630\u06CC\u0631\u062F:"
    )}<br>
${bi("Server", "\u0633\u0631\u0648\u0631")}:<textarea class="one" readonly>${escapeHtml(h)}</textarea>
<div style="margin-top:8px"><b>${bi("Ports &amp; Secrets", "\u067E\u0648\u0631\u062A\u200C\u0647\u0627 \u0648 \u0633\u06A9\u0631\u062A\u200C\u0647\u0627")}:</b></div>
${manualItems}</div>`;
    return `<h2>${escapeHtml(h)}</h2>${note}${manual}${items}`;
  }).join("");
  const latencyHref = "/panel/latency";
  const logoutForm = `<div class="card"><form method="post" action="/logout" style="display:inline"><button type="submit" style="padding:6px 14px;border-radius:8px;background:#eef2ff;border:1px solid #ccd;cursor:pointer">${bi("Sign out", "\u062E\u0631\u0648\u062C")}</button></form> <a class="plain" href="${escapeHtml(statusHref)}">${bi("Status &amp; logs", "\u0648\u0636\u0639\u06CC\u062A \u0648 \u0644\u0627\u06AF\u200C\u0647\u0627")}</a> <a class="plain" href="${escapeHtml(latencyHref)}">${bi("Latency test", "\u062A\u0633\u062A \u062A\u0623\u062E\u06CC\u0631")}</a></div>`;
  const body = `<h1>${bi("Proxy panel", "\u067E\u0646\u0644 \u067E\u0631\u0648\u06A9\u0633\u06CC")}</h1>
${deprecated}${legacyWarn}${adminWarn}
<div class="card">${bi(
    "Tap <b>Connect in Telegram</b> to add the proxy. Each port has its own secret and strict isolation is on: a secret only works on its own port. If a port does not connect, try another one.",
    "\u0631\u0648\u06CC \xAB\u0627\u062A\u0635\u0627\u0644 \u062F\u0631 \u062A\u0644\u06AF\u0631\u0627\u0645\xBB \u0628\u0632\u0646\u06CC\u062F \u062A\u0627 \u067E\u0631\u0648\u06A9\u0633\u06CC \u0627\u0636\u0627\u0641\u0647 \u0634\u0648\u062F. \u0647\u0631 \u067E\u0648\u0631\u062A \u0633\u06A9\u0631\u062A \u062E\u0648\u062F\u0634 \u0631\u0627 \u062F\u0627\u0631\u062F \u0648 \u062C\u062F\u0627\u0633\u0627\u0632\u06CC \u0633\u062E\u062A\u06AF\u06CC\u0631\u0627\u0646\u0647 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A: \u0647\u0631 \u0633\u06A9\u0631\u062A \u0641\u0642\u0637 \u0631\u0648\u06CC \u067E\u0648\u0631\u062A \u062E\u0648\u062F\u0634 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0627\u06AF\u0631 \u06CC\u06A9 \u067E\u0648\u0631\u062A \u0648\u0635\u0644 \u0646\u0634\u062F\u060C \u067E\u0648\u0631\u062A \u062F\u06CC\u06AF\u0631\u06CC \u0631\u0627 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0646\u06CC\u062F."
  )}</div>
<div class="card warn">${bi(
    "Do not share this page. Share only the links, or the server, port and matching secret.",
    "\u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u0631\u0627 \u0628\u0627 \u06A9\u0633\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0646\u06AF\u0630\u0627\u0631\u06CC\u062F. \u0641\u0642\u0637 \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627 \u06CC\u0627 \u0633\u0631\u0648\u0631\u060C \u067E\u0648\u0631\u062A \u0648 \u0633\u06A9\u0631\u062A \u0645\u0631\u0628\u0648\u0637\u0647 \u0631\u0627 \u0628\u0641\u0631\u0633\u062A\u06CC\u062F."
  )}</div>
${logoutForm}
${userSection}
${sections}`;
  return new Response(bilingualPage("Panel", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}
__name(servePanel, "servePanel");
var LATENCY_SCRIPT = `document.addEventListener('click',function(e){if(!e.target.closest('#run-latency'))return;e.preventDefault();var out=document.getElementById('latency-out');out.innerHTML='';var hosts=JSON.parse(document.getElementById('latency-hosts').textContent);var i=0;function next(){if(i>=hosts.length){return}var h=hosts[i++];var ports=[443,2053,2083,2087,2096,8443];var row=document.createElement('div');row.textContent=h;out.appendChild(row);var done=0;ports.forEach(function(p){var t0=performance.now();var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort()},6000);fetch('https://'+h+':'+p+'/health',{mode:'no-cors',cache:'no-store',signal:ctrl.signal,redirect:'error'}).then(function(){clearTimeout(to);add(h,p,Math.round(performance.now()-t0),true)}).catch(function(){clearTimeout(to);add(h,p,Math.round(performance.now()-t0),false)}).finally(function(){if(++done===ports.length)setTimeout(next,50)})})}function add(h,p,ms,ok){var s=document.createElement('span');s.style.marginInlineStart='12px';s.style.fontFamily='monospace';s.textContent=(ok?'\\u2713 ':'\\u2717 ')+p+': '+ms+'ms';s.style.color=ok?'#177245':'#b33';out.lastChild.appendChild(s)}next();});`;
function serveLatency(cfg, host, lang, nonce) {
  const hosts = [host, ...cfg.extraHosts || []].filter(Boolean);
  const body = `<h1>${bi("Latency test", "\u062A\u0633\u062A \u062A\u0623\u062E\u06CC\u0631")}</h1>
<div class="card muted">${bi(
    "Measures the round-trip from YOUR browser to each Cloudflare HTTPS port on each host, so you can pick the fastest port for your network. Results depend on your ISP; nothing is recorded server-side.",
    "\u0632\u0645\u0627\u0646 \u0631\u0641\u062A\u200C\u0648\u0628\u0631\u06AF\u0634\u062A \u0627\u0632 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0634\u0645\u0627 \u062A\u0627 \u0647\u0631 \u067E\u0648\u0631\u062A HTTPS \u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0631\u0648\u06CC \u0647\u0631 \u062F\u0627\u0645\u0646\u0647 \u0631\u0627 \u0645\u06CC\u200C\u0633\u0646\u062C\u062F \u062A\u0627 \u0633\u0631\u06CC\u0639\u200C\u062A\u0631\u06CC\u0646 \u067E\u0648\u0631\u062A \u0634\u0628\u06A9\u0647 \u062E\u0648\u062F\u062A\u0627\u0646 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F. \u0646\u062A\u06CC\u062C\u0647 \u0628\u0647 ISP \u0634\u0645\u0627 \u0628\u0633\u062A\u06AF\u06CC \u062F\u0627\u0631\u062F\u061B \u0686\u06CC\u0632\u06CC \u0633\u0645\u062A \u0633\u0631\u0648\u0631 \u0630\u062E\u06CC\u0631\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F."
  )}</div>
<div class="card"><button id="run-latency" type="button" style="padding:8px 18px;border-radius:8px;background:#2a9df4;color:#fff;border:0;cursor:pointer">${bi("Run test", "\u0627\u062C\u0631\u0627\u06CC \u062A\u0633\u062A")}</button><div id="latency-out" style="margin-top:10px;font-size:14px"></div></div>
<script type="application/json" id="latency-hosts">${JSON.stringify(hosts)}<\/script>`;
  return new Response(bilingualPage("Latency", lang, body, nonce, LATENCY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}
__name(serveLatency, "serveLatency");
function envReport(cfg) {
  const rows = [];
  const row = /* @__PURE__ */ __name((name, state) => rows.push(`<tr><td><code>${name}</code></td><td>${state}</td></tr>`), "row");
  row("ADMIN_KEY", cfg.adminKey ? "set" + (cfg.adminIssues.length ? ` <span class="badc">(${cfg.adminIssues.length} warning${cfg.adminIssues.length > 1 ? "s" : ""})</span>` : "") : "unset");
  row("SECRET", cfg.secretDerived ? 'unset \u2014 <span class="badc">legacy derivation from ADMIN_KEY</span>' : "set (independent secret)");
  row("KEY_EPOCH", cfg.keyEpoch ? `set (fingerprint ${cfg.keyEpochFingerprint})` : "unset");
  row("CARRIER", escapeHtml(cfg.carrierResolved || cfg.carrier));
  row("HOSTNAME", cfg.hosts.length && !cfg.hosts.includes("*") ? escapeHtml(cfg.hosts.join(", ")) : "* (all hosts)");
  row("EXTRA_HOSTS", (cfg.extraHosts || []).length ? escapeHtml(cfg.extraHosts.join(", ")) : "unset");
  row("DECOY_URL", cfg.decoyUrl ? "set (edge-cached 60 s)" : "unset (built-in branded storefront)");
  row("ALERT_URL", cfg.alertUrl ? "set (webhook enabled)" : "unset (no alerts)");
  row("MAX_STREAMS", String(cfg.maxStreams));
  row("SESSION_PATH", escapeHtml(cfg.sessionPath) + (cfg.sessionPathDerived ? " (derived)" : " (env)"));
  row("WS_PATH", escapeHtml(cfg.wsPath) + (cfg.wsPathDerived ? " (derived)" : " (env)"));
  row("SESSION_TTL", fmtDuration(cfg.sessionTtl * 1e3));
  row("UP_BATCH_BYTES", String(cfg.upBatchBytes));
  row("DATA_CHUNK", String(cfg.dataChunk));
  row("MAX_ISOLATE_QUEUED", fmtBytes(cfg.maxIsolateQueued));
  row("LEGACY_PORT_SECRETS", cfg.legacyPortSecrets ? '<span class="badc">enabled \u2014 cross-port secrets accepted</span>' : "disabled (strict port isolation)");
  row("USER_SECRETS", cfg.userSecrets.length ? escapeHtml(cfg.userSecrets.map((u) => u.label).join(", ")) : "unset");
  row("DC_OVERRIDE", cfg.dcOverrideApplied ? "active" : "unset (built-in DC list)");
  for (const issue of cfg.envIssues || []) row("validation", `<span class="badc">${escapeHtml(issue)}</span>`);
  for (const name of cfg.unknownEnv || []) row(escapeHtml(name), '<span class="badc">unrecognized variable (check spelling)</span>');
  return rows.join("");
}
__name(envReport, "envReport");
async function serveStatus(cfg, host, lang, wantsProbe, probeResults, nonce, via) {
  STATS.statusViews++;
  logEvent("status_view", host);
  const probe = probeResults;
  const secretMode = cfg.secretDerived ? bi("derived from ADMIN_KEY (legacy)", "\u0645\u0634\u062A\u0642 \u0627\u0632 ADMIN_KEY (\u0642\u062F\u06CC\u0645\u06CC)") : bi("fixed SECRET", "SECRET \u062B\u0627\u0628\u062A");
  const infoRows = [
    [bi("Version", "\u0646\u0633\u062E\u0647"), escapeHtml(VERSION)],
    [bi("Carrier", "\u062D\u0627\u0645\u0644"), escapeHtml(cfg.carrierResolved || cfg.carrier)],
    [bi("Secret mode", "\u062D\u0627\u0644\u062A \u0633\u06A9\u0631\u062A"), secretMode],
    [bi("Decoy brand", "\u0628\u0631\u0646\u062F \u0641\u0631\u06CC\u0628"), escapeHtml(cfg.brand.name)],
    [bi("Max streams per session", "\u062D\u062F\u0627\u06A9\u062B\u0631 \u0627\u0633\u062A\u0631\u06CC\u0645 \u062F\u0631 \u0647\u0631 \u0646\u0634\u0633\u062A"), String(cfg.maxStreams)]
  ].map((row) => `<tr><th>${row[0]}</th><td>${row[1]}</td></tr>`).join("");
  const statsRows = [
    [bi("Proxy sessions", "\u0646\u0634\u0633\u062A\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC"), String(STATS.sessions)],
    [bi("Active sessions (isolate)", "\u0646\u0634\u0633\u062A\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 (\u0627\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647)"), String(STATS.sessionsActive)],
    [bi("Streams opened", "\u0627\u0633\u062A\u0631\u06CC\u0645\u200C\u0647\u0627\u06CC \u0628\u0627\u0632 \u0634\u062F\u0647"), String(STATS.streams)],
    [bi("DC connects ok / failed", "\u0627\u062A\u0635\u0627\u0644\u200C\u0647\u0627\u06CC DC \u0645\u0648\u0641\u0642 / \u0646\u0627\u0645\u0648\u0641\u0642"), STATS.dcAttempts - STATS.dcFails + " / " + STATS.dcFails],
    [bi("Traffic up / down", "\u062A\u0631\u0627\u0641\u06CC\u06A9 \u0628\u0627\u0644\u0627 / \u067E\u0627\u06CC\u06CC\u0646"), fmtBytes(STATS.bytesUp) + " / " + fmtBytes(STATS.bytesDown)],
    [bi("Rejected WS tokens", "\u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC WebSocket \u0631\u062F\u0634\u062F\u0647"), String(STATS.wsRejects)],
    [bi("Isolate queued bytes (guard)", "\u0628\u0627\u06CC\u062A \u0635\u0641\u200C\u0634\u062F\u0647 \u0627\u06CC\u0632\u0648\u0644\u0647 (\u0646\u06AF\u0647\u0628\u0627\u0646)"), fmtBytes(MEMORY.queued) + " / " + fmtBytes(MEMORY.cap)],
    [bi("Isolate uptime", "\u0645\u062F\u062A \u0641\u0639\u0627\u0644\u06CC\u062A \u0627\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647"), fmtDuration(Date.now() - ISOLATE_START)]
  ].map((row) => `<tr><th>${row[0]}</th><td>${escapeHtml(row[1])}</td></tr>`).join("");
  const dcRows = Object.keys(cfg.dc).map(Number).sort((a, b) => a - b).map((dcKey) => {
    const ema = DC_EMA[dcKey];
    const last = DC_LAST_GOOD.get(dcKey);
    return `<tr><td>DC${dcKey}</td><td>${ema === void 0 ? "\u2014" : ema + " ms (EMA)"}</td><td>${last ? escapeHtml(last.ip + ":" + last.port) : "\u2014"}</td></tr>`;
  }).join("");
  const dcBlock = `<div class="card"><b>${bi("DC connect performance", "\u06A9\u0627\u0631\u0627\u06CC\u06CC \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631\u0647\u0627")}</b> <span class="muted">${bi("(per-isolate, ordering hints for failover)", "(\u0645\u062E\u0635\u0648\u0635 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647\u060C \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u062A\u0631\u062A\u06CC\u0628 \u0627\u062A\u0635\u0627\u0644)")}</span><table><tr><th>DC</th><th>${bi("Latency", "\u062A\u0623\u062E\u06CC\u0631")}</th><th>${bi("Last good endpoint", "\u0622\u062E\u0631\u06CC\u0646 \u0646\u0642\u0637\u0647 \u0633\u0627\u0644\u0645")}</th></tr>${dcRows}</table></div>`;
  const cpuNote = `<div class="card muted">${bi(
    `"${STATS.cpuSuspect}" sessions ended by an abrupt socket error or a missing pong. These can be client network drops, isolate recycling, or the 10 ms CPU limit being hit (Cloudflare does not expose CPU exhaustion to the Worker \u2014 this counter is a weak indicator, not a measurement).`,
    `${STATS.cpuSuspect} \u0646\u0634\u0633\u062A \u0628\u0627 \u062E\u0637\u0627\u06CC \u0646\u0627\u06AF\u0647\u0627\u0646\u06CC \u0633\u0648\u06A9\u062A \u06CC\u0627 \u0642\u0637\u0639 \u067E\u06CC\u0646\u06AF \u062A\u0645\u0627\u0645 \u0634\u062F\u0647\u200C\u0627\u0646\u062F. \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0642\u0637\u0639\u06CC \u0634\u0628\u06A9\u0647 \u06A9\u0627\u0631\u0628\u0631\u060C \u0628\u0627\u0632\u06CC\u0627\u0641\u062A \u0627\u06CC\u0632\u0648\u0644\u0647 \u06CC\u0627 \u0631\u0633\u06CC\u062F\u0646 \u0628\u0647 \u0633\u0642\u0641 \u06F1\u06F0 \u0645\u06CC\u0644\u06CC\u200C\u062B\u0627\u0646\u06CC\u0647 CPU \u0628\u0627\u0634\u062F (\u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0627\u062A\u0645\u0627\u0645 CPU \u0631\u0627 \u0628\u0647 \u0648\u0631\u06A9\u0631 \u0646\u0634\u0627\u0646 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F \u2014 \u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0646\u062F\u0647 \u0646\u0634\u0627\u0646\u0647 \u0636\u0639\u06CC\u0641 \u0627\u0633\u062A \u0646\u0647 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC).`
  )}</div>`;
  const probeBlock = probe ? `<div class="card"><b>${bi("DC reachability probe", "\u062A\u0633\u062A \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631\u0647\u0627")}</b><table><tr><th>DC</th><th>IP</th><th>${bi("Result", "\u0646\u062A\u06CC\u062C\u0647")}</th></tr>${probe.map((r) => `<tr><td>DC${r.dc}</td><td>${escapeHtml(r.ip)}</td><td class="${r.ok ? "ok" : "badc"}">${r.ok ? "OK" : "FAIL"} (${r.ms} ms)</td></tr>`).join("")}</table></div>` : `<div class="card"><a class="plain" href="?probe=1">${bi("Run DC reachability probe", "\u0627\u062C\u0631\u0627\u06CC \u062A\u0633\u062A \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631\u0647\u0627\u06CC \u062A\u0644\u06AF\u0631\u0627\u0645")}</a><p class="muted">${bi("Opens and immediately closes one TCP socket per DC from this Cloudflare location.", "\u0628\u0631\u0627\u06CC \u0647\u0631 \u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631 \u06CC\u06A9 \u0627\u062A\u0635\u0627\u0644 TCP \u0627\u0632 \u0647\u0645\u06CC\u0646 \u0644\u0648\u06A9\u06CC\u0634\u0646 \u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0628\u0627\u0632 \u0648 \u0628\u0644\u0627\u0641\u0627\u0635\u0644\u0647 \u0628\u0633\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.")}</p></div>`;
  const logRows = logSnapshot(60).map((e) => `<tr><td>${new Date(e.t).toISOString().slice(11, 19)}</td><td>${escapeHtml(e.event)}</td><td>${escapeHtml(e.detail)}</td></tr>`).join("");
  const logsBlock = `<div class="card"><b>${bi("Recent events", "\u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631")}</b> <span class="muted">${bi("(newest first, isolate memory only)", "(\u062C\u062F\u06CC\u062F\u062A\u0631\u06CC\u0646 \u0627\u0648\u0644\u060C \u0641\u0642\u0637 \u062D\u0627\u0641\u0638\u0647 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647)")}</span><table><tr><th>UTC</th><th>event</th><th>detail</th></tr>${logRows || `<tr><td colspan="3">-</td></tr>`}</table></div>`;
  const envBlock = `<div class="card"><b>${bi("Environment", "\u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0645\u062D\u06CC\u0637\u06CC")}</b> <span class="muted">${bi("(values are never displayed)", "(\u0645\u0642\u0627\u062F\u06CC\u0631 \u0647\u0631\u06AF\u0632 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F)")}</span><table><tr><th>${bi("Variable", "\u0645\u062A\u063A\u06CC\u0631")}</th><th>${bi("State", "\u0648\u0636\u0639\u06CC\u062A")}</th></tr>${envReport(cfg)}</table></div>`;
  const body = `<h1>${bi("Proxy status", "\u0648\u0636\u0639\u06CC\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC")}</h1>
<div class="card muted">${bi(
    "Counters and logs are kept in this Cloudflare isolate only, reset when it is recycled, and are not shared between regions. No client IP addresses, tokens or secrets are recorded.",
    "\u0634\u0645\u0627\u0631\u0646\u062F\u0647\u200C\u0647\u0627 \u0648 \u0644\u0627\u06AF\u200C\u0647\u0627 \u0641\u0642\u0637 \u062F\u0631 \u062D\u0627\u0641\u0638\u0647 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0632\u0648\u0644\u0647 \u06A9\u0644\u0648\u062F\u0641\u0644\u0631 \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u060C \u0628\u0627 \u0628\u0627\u0632\u06CC\u0627\u0641\u062A \u0627\u06CC\u0632\u0648\u0644\u0647 \u0635\u0641\u0631 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0628\u06CC\u0646 \u0645\u0646\u0637\u0642\u0647\u200C\u0647\u0627 \u0645\u0634\u062A\u0631\u06A9 \u0646\u06CC\u0633\u062A\u0646\u062F. \u0647\u06CC\u0686 IP\u060C \u062A\u0648\u06A9\u0646 \u06CC\u0627 \u0633\u06A9\u0631\u062A\u06CC \u062B\u0628\u062A \u0646\u0645\u06CC\u200C\u0634\u0648\u062F."
  )}</div>
<div class="card"><b>${bi("Configuration", "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC")}</b><table>${infoRows}</table></div>
<div class="card"><b>${bi("Live statistics", "\u0622\u0645\u0627\u0631 \u0632\u0646\u062F\u0647")}</b><table>${statsRows}</table></div>
${dcBlock}${cpuNote}
${envBlock}
${probeBlock}
${logsBlock}`;
  return new Response(bilingualPage("Status", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}
__name(serveStatus, "serveStatus");

// src/handlers.js
import { connect as cfConnect } from "cloudflare:sockets";
var cachedRuntime = null;
var cachedKey = null;
function runtimeCacheKey(env) {
  const parts = [];
  for (const k of ["SECRET", "ADMIN_KEY", "KEY_EPOCH", "HOSTNAME", "EXTRA_HOSTS", "DECOY_URL", "CARRIER", "MAX_STREAMS", "SESSION_PATH", "WS_PATH", "DEBUG", "UP_BATCH_BYTES", "DATA_CHUNK", "MAX_QUEUED", "MAX_ISOLATE_QUEUED", "DC_OVERRIDE", "USER_SECRETS", "LEGACY_PORT_SECRETS", "ALERT_URL", "BOOTSTRAP_TTL", "SESSION_TTL"]) {
    parts.push(k + "=" + (typeof env?.[k] === "string" ? env[k] : ""));
  }
  return parts.join("|");
}
__name(runtimeCacheKey, "runtimeCacheKey");
async function getRuntime(env) {
  const key = runtimeCacheKey(env);
  if (cachedRuntime && cachedKey === key) return withResolvedCarrier(cachedRuntime);
  const resolved = resolveConfig(env);
  const runtime = await buildRuntime(resolved);
  if (runtime) {
    runtime.decoyHtml = brandifyDecoy(DECOY_TEMPLATE, runtime.brand);
    runtime.healthJson = healthJson(runtime.brand);
    runtime.faviconSvg = faviconSvg(runtime.brand);
    cachedRuntime = runtime;
    cachedKey = key;
  }
  return withResolvedCarrier(runtime);
}
__name(getRuntime, "getRuntime");
var AUTO_LANE_THRESHOLD = 500;
function withResolvedCarrier(runtime) {
  if (!runtime) return runtime;
  runtime.carrierResolved = runtime.carrier === "auto" ? STATS.sessions >= AUTO_LANE_THRESHOLD ? "websocket" : "websocket-lanes" : runtime.carrier;
  return runtime;
}
__name(withResolvedCarrier, "withResolvedCarrier");
function hostAllowed(cfg, host) {
  if (!/^[a-z0-9.-]+$/.test(host) || host.includes("..")) return false;
  if (cfg.hosts.length === 0 || cfg.hosts.includes("*") || cfg.hosts.length === 1 && cfg.hosts[0] === "proxy.example.com") {
    return true;
  }
  return cfg.hosts.includes(host) || (cfg.extraHosts || []).includes(host);
}
__name(hostAllowed, "hostAllowed");
async function serveSession(request, cfg, host) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ") || auth.length <= 7) return decoy(cfg);
  const token = auth.substring(7);
  if (request.method === "DELETE") {
    if (!await verifyToken(cfg, token, TOKEN_KIND_SESSION, host)) return decoy(cfg);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  if (request.method !== "POST") return decoy(cfg);
  if (request.headers.get("cookie")) return decoy(cfg);
  if ((request.headers.get("content-type") || "").toLowerCase() !== "application/octet-stream") return decoy(cfg);
  const declaredLength = parseInt(request.headers.get("content-length") || "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > 4096) return decoy(cfg);
  const verified = await verifyToken(cfg, token, TOKEN_KIND_BOOTSTRAP, host);
  if (!verified) return decoy(cfg);
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.length !== 9) return decoy(cfg);
  if (body[0] !== 16 || body[1] !== 0 || body[2] !== 0 || body[3] !== 0) return decoy(cfg);
  if (body[4] !== 0 || body[5] !== 0 || body[6] !== 0 || body[7] !== 1 || body[8] !== 1) return decoy(cfg);
  const sessionToken = await issueToken(cfg, TOKEN_KIND_SESSION, cfg.sessionTtl, verified.mode, host);
  return new Response(WELCOME, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Session-Token": sessionToken,
      "X-Down-Cursor": "0",
      "X-Carrier-Mode": cfg.carrierResolved || cfg.carrier
    }
  });
}
__name(serveSession, "serveSession");
async function serveWebSocket(request, cfg, host, port) {
  if (request.method !== "GET") return decoy(cfg);
  if ((request.headers.get("upgrade") || "").toLowerCase() !== "websocket") return decoy(cfg);
  if (request.headers.get("authorization")) return decoy(cfg);
  const offered = (request.headers.get("sec-websocket-protocol") || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (offered.length !== 1) return decoy(cfg);
  const protocol = offered[0];
  let token = "";
  let laneId = 0;
  if (protocol.startsWith("tproxy-v1.")) {
    token = protocol.substring(10);
  } else if (protocol.startsWith("tproxy-lane-v1.")) {
    const rest = protocol.substring(15);
    const dot = rest.lastIndexOf(".");
    if (dot <= 0 || !/^[1-9][0-9]{0,7}$/.test(rest.substring(dot + 1))) return decoy(cfg);
    token = rest.substring(0, dot);
    laneId = parseInt(rest.substring(dot + 1), 10);
    if (laneId > 16777215) return decoy(cfg);
  } else {
    return decoy(cfg);
  }
  const verified = await verifyToken(cfg, token, TOKEN_KIND_SESSION, host);
  if (!verified) {
    STATS.wsRejects++;
    logEvent("ws_reject", "invalid or expired session token");
    return decoy(cfg);
  }
  const secret = await modeSecret(cfg, verified.mode, host, port);
  if (!secret) return decoy(cfg);
  if (verified.mode >= 20 && verified.mode < 36) {
    const user = cfg.userSecrets[verified.mode - 20];
    if (user) USER_SESSIONS[user.label] = (USER_SESSIONS[user.label] || 0) + 1;
  }
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.binaryType = "arraybuffer";
  server.accept();
  const session = new WsSession(server, cfg, secret, laneId, cfConnect);
  server.addEventListener("message", (event) => session.enqueue(event.data));
  server.addEventListener("close", () => {
    if (!session.closed) STATS.cpuSuspect++;
    session.dispose();
  });
  server.addEventListener("error", () => {
    if (!session.closed) STATS.cpuSuspect++;
    session.dispose();
  });
  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: {
      "Sec-WebSocket-Protocol": protocol
    }
  });
}
__name(serveWebSocket, "serveWebSocket");
function cookieValue(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return "";
}
__name(cookieValue, "cookieValue");
async function resolveAdmin(url, request, cfg, host) {
  if (!cfg.adminKey) return null;
  let path = "";
  try {
    path = decodeURIComponent(url.pathname.slice(1));
  } catch (_) {
    return null;
  }
  if (path.endsWith("/")) path = path.slice(0, -1);
  const cookie = cookieValue(request, COOKIE_NAME);
  if (cookie && (path === "panel" || path === "panel/status" || path === "panel/latency")) {
    if (await verifyCookie(cfg, host, cookie)) {
      if (path === "panel/status") return { kind: "status", via: "cookie" };
      if (path === "panel/latency") return { kind: "latency", via: "cookie" };
      return { kind: "panel", via: "cookie" };
    }
    return null;
  }
  if (path && path !== "login") {
    if (/^[A-Za-z0-9_-]{16,128}(\/status)?$/.test(path)) {
      if (loginLocked()) return null;
      if (safeEqual(path, cfg.adminKey)) {
        loginSuccess();
        return { kind: "panel", via: "url" };
      }
      if (safeEqual(path, cfg.adminKey + "/status")) {
        loginSuccess();
        return { kind: "status", via: "url" };
      }
      loginFailure();
    }
  }
  return null;
}
__name(resolveAdmin, "resolveAdmin");
async function probeDcs(cfg) {
  const keys = Object.keys(cfg.dc).map(Number).sort((a, b) => a - b);
  const results = [];
  const probeOne = /* @__PURE__ */ __name(async (key) => {
    const ips = Array.isArray(cfg.dc[key]) ? cfg.dc[key] : [cfg.dc[key]];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const started = Date.now();
    let socket = null;
    try {
      socket = cfConnect({ hostname: ip, port: cfg.dcPort || 443 }, { secureTransport: "off" });
      socket.closed.catch(() => {
      });
      await Promise.race([socket.opened, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500))]);
      try {
        await socket.close();
      } catch (_) {
      }
      results.push({ dc: key, ip, ok: true, ms: Date.now() - started });
    } catch (_) {
      if (socket) {
        try {
          socket.close().catch(() => {
          });
        } catch (_2) {
        }
      }
      results.push({ dc: key, ip, ok: false, ms: Date.now() - started });
    }
  }, "probeOne");
  for (let i = 0; i < keys.length; i += 3) {
    await Promise.all(keys.slice(i, i + 3).map(probeOne));
  }
  logEvent("dc_probe", results.map((r) => "DC" + r.dc + (r.ok ? ":ok" : ":fail")).join(" "));
  return results;
}
__name(probeDcs, "probeDcs");

// src/worker.js
function randomNonce() {
  return b64uEncode(crypto.getRandomValues(new Uint8Array(18)));
}
__name(randomNonce, "randomNonce");
function strongKeySuggestion() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
__name(strongKeySuggestion, "strongKeySuggestion");
function hexSecretSuggestion() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hexSecretSuggestion, "hexSecretSuggestion");
function sameOriginForm(request, url) {
  const origin = request.headers.get("origin") || "";
  if (!origin) return false;
  try {
    return requestHost(request, url) === new URL(origin).host.toLowerCase().replace(/\.$/, "").split(":")[0] || requestHost(request, url) === new URL(origin).hostname;
  } catch (_) {
    return false;
  }
}
__name(sameOriginForm, "sameOriginForm");
var worker_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const host = requestHost(request, url);
      const rawHost = String(request.headers.get("host") || url.host || "");
      const portMatch = /:([0-9]+)$/.exec(rawHost);
      const port = portMatch ? portMatch[1] : url.port || "";
      const lang = url.searchParams.get("lang") === "fa" ? "fa" : "en";
      let cfg = null;
      try {
        cfg = await getRuntime(env);
      } catch (e) {
        logEvent("cfg_error", e && e.name ? e.name : "unknown");
      }
      if (!cfg) {
        if (url.pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
          return serveSetup(null, host, lang, request.method, randomNonce(), { adminKey: strongKeySuggestion(), secret: hexSecretSuggestion() });
        }
        return decoy(null, request.method);
      }
      if (request.method === "GET" || request.method === "HEAD") {
        if (url.pathname === "/robots.txt") {
          return new Response(request.method === "HEAD" ? null : "User-agent: *\nAllow: /\nDisallow: /panel\nDisallow: /login\n", {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" }
          });
        }
        if (url.pathname === "/favicon.ico") {
          return new Response(request.method === "HEAD" ? null : cfg.faviconSvg, {
            status: 200,
            headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" }
          });
        }
        if (url.pathname === "/health" || url.pathname === "/status") {
          return new Response(request.method === "HEAD" ? null : cfg.healthJson, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" }
          });
        }
      }
      if (url.pathname === "/login") {
        if (request.method === "GET" || request.method === "HEAD") {
          if (loginLocked()) return decoy(cfg, request.method);
          return serveLogin(cfg, host, lang, randomNonce());
        }
        if (request.method === "POST") {
          if (loginLocked()) return decoy(cfg, request.method);
          if (!sameOriginForm(request, url)) return decoy(cfg, request.method);
          const form = await request.formData().catch(() => null);
          const key = form ? String(form.get("key") || "") : "";
          if (!cfg.adminKey || !key || !safeEqual(key, cfg.adminKey)) {
            loginFailure();
            logEvent("login_fail", "form");
            return serveLogin(cfg, host, lang, randomNonce(), "bad");
          }
          loginSuccess();
          logEvent("login_ok", "form");
          const { value, maxAge } = await issueCookie(cfg, host);
          return new Response(null, {
            status: 303,
            headers: {
              "Location": "/panel",
              "Set-Cookie": `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
            }
          });
        }
        return decoy(cfg, request.method);
      }
      if (url.pathname === "/logout" && request.method === "POST") {
        if (sameOriginForm(request, url)) {
          return new Response(null, {
            status: 303,
            headers: { "Location": "/login", "Set-Cookie": `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` }
          });
        }
        return decoy(cfg, request.method);
      }
      const admin = await resolveAdmin(url, request, cfg, host);
      if (admin && (request.method === "GET" || request.method === "HEAD")) {
        const nonce = randomNonce();
        if (admin.kind === "status") {
          const wantsProbe = url.searchParams.get("probe") === "1";
          const probe = wantsProbe ? await probeDcs(cfg) : null;
          return serveStatus(cfg, host, lang, wantsProbe, probe, nonce, admin.via);
        }
        if (admin.kind === "latency") {
          return serveLatency(cfg, host, lang, nonce);
        }
        return servePanel(cfg, host, port, lang, nonce, admin.via);
      }
      if (!cfg.adminKey && url.pathname === "/setup" && (request.method === "GET" || request.method === "HEAD")) {
        return serveSetup(cfg, host, lang, request.method, randomNonce(), { adminKey: strongKeySuggestion(), secret: hexSecretSuggestion() });
      }
      if (!hostAllowed(cfg, host)) return decoy(cfg, request.method);
      if (url.pathname === "/" && request.method === "GET") {
        const bridges = url.searchParams.getAll("bridge");
        if (bridges.length === 0) return decoy(cfg, request.method);
        const keys = Array.from(url.searchParams.keys());
        if (keys.length !== 1 || keys[0] !== "bridge" || bridges.length !== 1) return decoy(cfg, request.method);
        const mode = await bridgeMode(cfg, host, bridges[0], port);
        if (mode < 0) return decoy(cfg, request.method);
        const bootstrap = await issueToken(cfg, TOKEN_KIND_BOOTSTRAP, cfg.bootstrapTtl, mode, host);
        return serveBridge(cfg, host, mode, port, randomNonce(), bootstrap, cfg.carrierResolved || cfg.carrier);
      }
      if (url.pathname === cfg.sessionPath || url.pathname === LEGACY_SESSION_PATH) {
        return serveSession(request, cfg, host);
      }
      if (url.pathname === cfg.wsPath || url.pathname === LEGACY_WS_PATH) {
        return serveWebSocket(request, cfg, host, port);
      }
      return decoy(cfg, request.method);
    } catch (e) {
      logEvent("error", e && e.name ? e.name : "unknown");
      try {
        return await decoy(null, request.method);
      } catch (_) {
        return new Response("Service Unavailable", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
  }
};
export {
  worker_default as default
};
