/*
	externalExe

	For managing and using the external tools
*/

var _ = require("underscore")
var childProcess = require('child_process')
var fs = require("./fileSystem")
var stringTools = require("./stringTools")
var logger = require("./logger")
var consolex = require("./consolex")



/*
programs:
	name
		exePath
		params
*/
var ExternalExe = {
	default: {
		"path": "externalExe.cfg",
		"programs": {}
	},
	init: function() {
		this.logger = logger
		this.setup()
	},
	setup: function(params) {
		this.default = _.extend(this.default, params)
		var path = this.default.path
		var data = this.fetchConfig(path)
		var dict = JSON.parse(data)
		this.default.programs = dict
	},
	fetchConfig: function(path) {
		var data = fs.readFileSync(path, {"encoding": "utf8"})
		return data
	},
	get: function(name) {
		if (!this.default.programs[name]) {
			this.logger.error("ExternalExe error in getting program.")
			return false
		}
		return this._newExe(this.default.programs[name])
	},
	_newExe: function(progParams) {
		return ExternalExeObject.new(progParams)
	}
}

/*
default:
	exePath
	params
*/
var ExternalExeObject = {
	default: {
		"exePath": "",
		"params": "",
		"customParams": [],
		"spliter": " "
	},
	init: function(params) {
		this.default = _.extend(this.default, params)
	},
	new: function(params) {
		var newObj = Object.create(this)
		newObj.init(params)
		return newObj
	},
	addParams: function(arrOrStr) {
		var p
		if (_.isString(arrOrStr)) {
			p = [arrOrStr]
		} else if (_.isArray(arrOrStr)) {
			p = arrOrStr
		} else {
			return false
		}
		this.default.customParams = this.default.customParams.concat(p)
	},
	execute: function(toMapParams, cb) {
		var spliter = this.default.spliter,
			path = this.default.exePath,
			params = this.default.params,
			cusParams = this.default.customParams,
			finExePath = [path, params].concat(cusParams).join(spliter)
		finExePath = stringTools.formatter(finExePath, toMapParams)
		// return finExePath
		consolex.log("\nstarting executing...")
		consolex.log("externalExeObject's finExePath:", finExePath)
		childProcess.exec(finExePath, function(err) {
			if (err) {
				consolex.error("error in executing external exe.")
			}
			cb(err)
		})
	}
}

ExternalExe.init()
module.exports = ExternalExe