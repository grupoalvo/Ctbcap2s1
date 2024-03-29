// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function Hilitor2(id, tag)
{

  // private variables
  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag || "MARK";
  var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegExp = "";
  var openLeft = false;
  var openRight = false;
  var matches = [];

  // characters to strip from start and end of the input string
  var endRegExp = new RegExp('^[^\\w]+|[^\\w]+$', "g");

  // characters used to break up the input string into words
  var breakRegExp = new RegExp('[^\\w\'-]+', "g");

  this.setEndRegExp = function(regex)
  {
    endRegExp = regex;
    return true;
  };

  this.setBreakRegExp = function(regex)
  {
    breakRegExp = regex;
    return true;
  };

  this.setMatchType = function(type)
  {
    switch(type)
    {
      case "open":
        this.openLeft = this.openRight = true;
        break;

      case "closed":
        this.openLeft = this.openRight = false;
        break;

      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;

      case "left":
      default:
        this.openLeft = false;
        this.openRight = true;

    }
    return true;
  };

  // break user input into words and convert to RegExp
  this.setRegex = function(input)
  {
    input = input.replace(/\\u[0-9A-F]{4}/g, ""); // remove missed unicode
    input = input.replace(endRegExp, "");
    input = input.replace(breakRegExp, "|");
    input = input.replace(/^\||\|$/g, "");
    input = addAccents(input);
    if(input) {
      var re = "(" + input + ")";
      if(!this.openLeft) {
        re = "(?:^|[\\b\\s])" + re;
      }
      if(!this.openRight) {
        re = re + "(?:[\\b\\s]|$)";
      }
      matchRegExp = new RegExp(re, "i");
      return matchRegExp;
    }
    return false;
  };

  this.getRegex = function()
  {
    var retval = matchRegExp.toString();
    retval = retval.replace(/(^\/|\(\?:[^\)]+\)|\/i$)/g, "");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node) return;
    if(!matchRegExp) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegExp.exec(nv))) {
        if(!wordColor[regs[1].toLowerCase()]) {
          wordColor[regs[1].toLowerCase()] = colors[colorIdx++ % colors.length];
        }

        var match = document.createElement(hiliteTag);
        match.appendChild(document.createTextNode(regs[1]));
        match.style.backgroundColor = wordColor[regs[1].toLowerCase()];
        match.style.color = "#000";

        var after;
        if(regs[0].match(/^\s/)) { // in case of leading whitespace
          after = node.splitText(regs.index + 1);
        } else {
          after = node.splitText(regs.index);
        }
        after.nodeValue = after.nodeValue.substring(regs[1].length);
        node.parentNode.insertBefore(match, after);
      }
    };
  };

  // remove highlighting
  this.remove = function()
  {
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
    return true;
  };

  // start highlighting at target node
  this.apply = function(input)
  {
    this.remove();
    if(input === undefined || !(input = input.replace(/(^\s+|\s+$)/g, ""))) {
      return;
    }
    input = escapeUnicode(input);
    input = removeUnicode(input);
    if(this.setRegex(input)) {
      this.hiliteWords(targetNode);
    }

    // build array of matches
    matches = targetNode.getElementsByTagName(hiliteTag);

    // return number of matches
    return matches.length;
  };

  // scroll to the nth match
  this.gotoMatch = function(idx)
  {
    if(matches[idx]) {
      matches[idx].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      for(var i=0; i < matches.length; i++) {
        matches[i].style.outline = (idx == i) ? "2px solid red" : "";
      }
      return true;
    }
    return false;
  };

  // convert escaped UNICODE to ASCII
  function removeUnicode(input)
  {
    var retval = input;
    retval = retval.replace(/\\u(00E[024]|010[23]|00C2)/ig, "a");
    retval = retval.replace(/\\u00E7/ig, "c");
    retval = retval.replace(/\\u00E[89AB]/ig, "e");
    retval = retval.replace(/\\u(00E[EF]|00CE)/ig, "i");
    retval = retval.replace(/\\u00F[46]/ig, "o");
    retval = retval.replace(/\\u00F[9BC]/ig, "u");
    retval = retval.replace(/\\u00FF/ig, "y");
    retval = retval.replace(/\\u(00DF|021[89])/ig, "s");
    retval = retval.replace(/\\u(0163i|021[AB])/ig, "t");
    return retval;
  }

  // convert ASCII to wildcard
  function addAccents(input)
  {
    var retval = input;
    retval = retval.replace(/([ao])e/ig, "$1");
    retval = retval.replace(/ss/ig, "s");
    retval = retval.replace(/e/ig, "[eèéêë]");
    retval = retval.replace(/c/ig, "[cç]");
    retval = retval.replace(/i/ig, "[iîï]");
    retval = retval.replace(/u/ig, "[uùûü]");
    retval = retval.replace(/y/ig, "[yÿ]");
    retval = retval.replace(/s/ig, "(ss|[sßș])");
    retval = retval.replace(/t/ig, "([tţț])");
    retval = retval.replace(/a/ig, "([aàâäă]|ae)");
    retval = retval.replace(/o/ig, "([oôö]|oe)");
    return retval;
  }

  // added by Yanosh Kunsh to include utf-8 string comparison
  function dec2hex4(textString)
  {
    var hexequiv = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    return hexequiv[(textString >> 12) & 0xF] + hexequiv[(textString >> 8) & 0xF] + hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
  }

  // escape UNICODE characters in string
  function escapeUnicode(str)
  {
    // convertCharStr2jEsc
    // Converts a string of characters to JavaScript escapes
    // str: sequence of Unicode characters
    var highsurrogate = 0;
    var suppCP;
    var pad;
    var n = 0;
    var outputString = "";
    for(var i=0; i < str.length; i++) {
      var cc = str.charCodeAt(i);
      if(cc < 0 || cc > 0xFFFF) {
        outputString += '!Error in convertCharStr2UTF16: unexpected charCodeAt result, cc=' + cc + '!';
      }
      if(highsurrogate != 0) { // this is a supp char, and cc contains the low surrogate
        if(0xDC00 <= cc && cc <= 0xDFFF) {
          suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00);
          suppCP -= 0x10000;
          outputString += '\\u' + dec2hex4(0xD800 | (suppCP >> 10)) + '\\u' + dec2hex4(0xDC00 | (suppCP & 0x3FF));
          highsurrogate = 0;
          continue;
        } else {
          outputString += 'Error in convertCharStr2UTF16: low surrogate expected, cc=' + cc + '!';
          highsurrogate = 0;
        }
      }
      if(0xD800 <= cc && cc <= 0xDBFF) { // start of supplementary character
        highsurrogate = cc;
      } else { // this is a BMP character
        switch(cc)
        {
          case 0:
            outputString += '\\0';
            break;
          case 8:
            outputString += '\\b';
            break;
          case 9:
            outputString += '\\t';
            break;
          case 10:
            outputString += '\\n';
            break;
          case 13:
            outputString += '\\r';
            break;
          case 11:
            outputString += '\\v';
            break;
          case 12:
            outputString += '\\f';
            break;
          case 34:
            outputString += '\\\"';
            break;
          case 92:
            outputString += '\\\\';
            break;
          default:
            if(cc > 0x1f && cc < 0x7F) {
              outputString += String.fromCharCode(cc);
            } else {
              pad = cc.toString(16).toUpperCase();
              while(pad.length < 4) {
                pad = '0' + pad;
              }
              outputString += '\\u' + pad;
            }
        }
      }
    }
    return outputString;
  }

}
