/*
	consolex

	For displaying the message on console panel
*/

var options = require("../options")



var consolexOptions = options.consolex

var consolex = {
	info: function(args) {
		console.info.apply(console, args)
	},
	log: function(args) {
		console.log.apply(console, args)
	},
	error: function(args) {
		console.error.apply(console, args)
	}
}

var canOutput = function() {
	if (consolexOptions.canOutput) {
		return true
	} else {
		return false
	}
}

var prevAction = function() {
	if (!canOutput()) {
		return false
	}
	return true
}

for (var fn in consolex) {
	if (!consolex.hasOwnProperty(fn)) continue
	if (typeof consolex[fn] === "function") {
		consolex[fn] = (function() {
			var oriFn = consolex[fn]
			return function() {
				var args = Array.prototype.slice.call(arguments)
				var ret = prevAction(args)
				if (!ret) { return }
				oriFn(args)
			}
		})()
	}
}


module.exports = consolex