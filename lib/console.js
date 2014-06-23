/*
	console

	The helper methods for the console
*/

var _ = require("underscore")
var path = require("path")
var fs = require("./fileSystem")
var eventSystem = require("./eventSystem")
var consolex = require("./consolex")



var consoleParams = {
	default: {
		"keyPattern": /^-(.+)/
	},
	setup: function(k, v) {
		if (_.isObject(k)) {
			_.extend(this.default, k)
		} else if (_.isString(k)) {
			this.default[k] = v
		}
	},
	parseArgs: function(paramArgs) {
		var self = this
		var res = {}
		
		var curKey
		paramArgs.forEach(function(val) {
			if (self.isKey(val)) {
				curKey = self.getKey(val)
			} else {
				res[curKey] = val
			}
		})
		return res
	},
	isKey: function(str) {
		var keyPat = this.default.keyPattern
		return keyPat.test(str)
	},
	getKey: function(str) {
		var keyPat = this.default.keyPattern
		var match = str.match(keyPat)
		return match ? match[1] : ""
	},
	parse: function(paramArgs) {
		var params = this.parseArgs(paramArgs)
		return params
	}
}

var consolePanel = {
	getArgs: function() {
		var args = process.argv
		return args
	},
	getExecPath: function() {
		var execPath = process.execPath
		return execPath
	},
	changeCwd: function(dir) {
		// set the current working dir to the target dir
		var cwd
		try {
			var stat = fs.statSync(dir)
			if (stat.isDirectory()) {
				cwd = dir
			} else if (stat.isFile()) {
				cwd = path.dirname(fs.realpathSync(dir))
			}
		} catch(e) {
			consolex.error("error, no such file or directory: %s".replace("%s", dir))
			return false
		}
		return cwd
	}
}


module.exports = {
	"consolePanel": consolePanel,
	"consoleParams": consoleParams
}