/*
	stringTools

	@version 0.13
	@update
	* change the selector's regex pattern, and some place, to perform getting outer html strings

	The helper methods for dealing with string
*/


var _ = require("underscore")
var $ = require("cheerio")

var stringTools = {
	mapHtmlString: function(html, dataModel, _keepArray) {
		var source = _.isString(html)
			? $("<html>" + html + "</html>")
			: html
		
		var finResult = [],
			val
		for (var i = 0; i < source.length; i++) {
			val = source[i]

			var $val = _.isString(val) ? val : $(val),
				dmStar = dataModel["*"] || "",
				star

			var pattern = /\/(.+)\/(\w*)$/,
				re = dmStar.match(pattern)
			// check dmStar
			if (re) {
				var targetText = _.isString(val) ? val : (_.isString(html) ? html : html.html()),
					match = targetText.match(new RegExp(re[1], re[2]))

				star = match ? match : []
			} else {
				// check val
				if (_.isString($val)) {
					star = $val
				} else {
					var $valFind = $val.find(dmStar)
					star = dmStar
						? $valFind.length > 0 ? $valFind : $val.filter(dmStar)
						: $val
				}
			}

			var dmVal,
				res = {}
			for (var k in dataModel) {
				if (!dataModel.hasOwnProperty(k)) continue
				dmVal = dataModel[k]

				if (k === "*") {
					continue
				} else if (k === "[]") {
					res[k] = this.mapHtmlString(star, dmVal, true)
				} else if (_.isString(dmVal)) {
					res[k] = this.mapHtml_selectContent(star, dmVal)
				} else if (_.isObject(dmVal)) {
					// using layer's global value other than "*"
					res[k] = this.mapHtmlString($val, dmVal)
				}
			}
			finResult.push(res)
		}
		return _keepArray === true ? finResult : finResult[0]
	},
	mapHtml_selectContent: function selectContent(content, selector) {
		var results = [],
			res

		// for regexp
		if (_.isString(selector)
			&& selector.match(/^\s*\/.+\/\w*\s*$/)) {
			var rMatch = selector.match(/\/(.+)\/(\w*)$/),
				rRegexpStr = rMatch[1],
				rFlag = rMatch[2]

			if (!_.isString(content)) {
				content = content.html()
			}
			var rRe = new RegExp(rRegexpStr, rFlag)
			var finMatch = content.match(rRe)
			return finMatch ? finMatch[finMatch.length - 1] : ""
		}
		else if (_.isString(selector)) {
			// translate html content to jQuery object
			if (_.isString(content)) {
				content = $(content)
			}
			var arr = selector.match(/(^\(.*?\)|\|.*?\||.+?(?=\||$))/ig) || [""],
				htmlFlag = false,
				sel,
				match,
				qSel, att, repl

			for (var i = 0; i < arr.length; i++) {
				sel = arr[i].trim()

				if (sel.indexOf("(") === 0) {
					if (sel.indexOf("html") === 1) {
						htmlFlag = true
					}
					continue
				}
				if (sel.indexOf("|") === 0) {
					results.push(sel.slice(1, -1))
					continue
				}
				match = sel.match(/^\s*(.+?)?\s*(->\s*\[(.+?)\])?\s*(\[\[(.+?)\]\])?\s*$/)
				qSel = match[1]
				att = match[3]
				repl = match[5]

				if (sel === "") {
					res = content.text()
				}
				else if (qSel) {
					// if can't find the children, then find the first layer
					var con = content.find(qSel)
					if (con.length === 0) {
						con = content.filter(qSel)
					}
					if (con.length === 0 && att) {
						res = content.attr(att)
					} else if (con.length > 0 && att) {
						res = con.attr(att)
					} else if (con.length > 0 && !att) {
						console.log("htmlFlag and qSel:", htmlFlag, qSel)
						res = htmlFlag ? $("<div>").append(con).html() : con.text()
					} else {
						res = ""
					}
				}

				if (repl) {
					repl = repl.match(/^\s*\/(.+?)\/(\w*)\s*,\s*(.+)\s*$/)
					var regex = repl[1]
					var flag = repl[2]
					var mRepl = repl[3]
					
					if (regex && mRepl) {
						if (mRepl[0] === "'" && mRepl[mRepl.length - 1] === "'") {
							mRepl = mRepl.substr(1, mRepl.length - 2)
						} else if (mRepl.indexOf("function") === 0) {
							mRepl = (new Function("", "return %fn;".replace("%fn", mRepl)))()
						}
						res = res.replace(new RegExp(regex, flag), mRepl)
					}
				}
				results.push(res)
			}
			res = results.join(" ")

		}
		else if (_.isObject(selector)) {
			res = {}
			for (var k in selector) {
				if (!selector.hasOwnProperty(k)) continue
					res[k] = selectContent(content, selector[k])
			}
		}
		return res
	},

	// /*
	// 	deal with:
	// 		/regexp/, which is the regexp form
	// 		[[regexp, replacement]], which is the replacement form
	// */
	// old_mapString_selectContent: function(sel, content) {
	// 	var match,
	// 		res
	// 	// deal with regexp
	// 	if (_.isRegexp(sel)) {
	// 		match = content.match(sel)
	// 		return match ? match : ""
	// 	}
	// 	else if (_.isString(sel)) {
	// 		match = content.match(/(.+)\[\[\/(.+?)\/(\w*?),\s*(.+)\s*\]\]/)
	// 		if (!match) {
	// 			this.logger.error("mapString error: can not parse selector.")
	// 			return
	// 		}
	// 		var str = match[1],
	// 			regexpStr = match[2],
	// 			flag = match[3],
	// 			replacement = match[4]

	// 		if (regexpStr.trim() === "") {
	// 			return str
	// 		} else {
	// 			if (replacement[0] === "'" && replacement[replacement.length-1] === "'") {
	// 				// deal with string replacement
	// 				replacement = Array.prototype.slice.call(replacement, 1, -1)
	// 			} else if (replacement.indexOf("function") === 0) {
	// 				// deal with function replacement
	// 				replacement = new Function("", "return " + replacement)()
	// 			}
	// 			var re = new Regexp(regexpStr, flag)
	// 			res = content.replace(re, replacement)
	// 			return res
	// 		}
	// 	}
	// },

	/* formatter */

	// arr could be array or dict
	// can be {N} or {$N}, which N start from 0
	formatter: function(str, arr) {
		if (_.isString(arr) || _.isNumber(arr)) {
			// todo, check all the arguments type for safty
			arr = Array.prototype.slice.call(arguments, 1)
		} else if (_.isArray(arr) || _.isObject(arr)) {
			// continue
		} else {
			return false
		}
		var num = null
		var newStr = str.replace(/\{\$?(.+?)\}/ig, function(whole, p1) {
			num = parseInt(p1)
			num = num.toString() === p1 ? num : null
			if (num && _.isArray(arr)) {
				return arr[num - 1]
			} else if (_.isObject(arr) && arr.hasOwnProperty(p1)) {
				return arr[p1]
			}
			return ""
		})
		return newStr
	},
	// map the string with %s style
	formatter2: function(str, arr) {
		var count = -1
		if (_.isString(arr) || _.isNumber(arr)) {
			arr = Array.prototype.slice.call(arguments, 1)
		} else if (_.isArray(arr)) {
			// continue
		} else {
			return false
		}
		var newStr = str.replace(/%s/ig, function() {
			count += 1
			return arr[count]
		})
		return newStr
	},

	/* string encoding */

	_stringEncodingMap: function() {
		return {
			"\t": "\\t$",
			"\n": "\\n$"
		}
	},
	stringEncode: function(content) {
		var map = this._stringEncodingMap()
		for (var k in map) {
			if (!map.hasOwnProperty(k)) continue
			content = content.replace(k, map[k])
		}
		return content
	},
	stringDecode: function(content) {
		var map = this._stringEncodingMap()

		var key,
			val
		for (var k in map) {
			if (!map.hasOwnProperty(k)) continue
			key = map[k]
			val = k
			content = content.replace(key, val)
		}
		return content
	}

}


module.exports = stringTools