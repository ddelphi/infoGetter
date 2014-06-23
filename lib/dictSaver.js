/*
	dictSaver

	For saving the log and content to files
*/

var _ = require("underscore")
var fs = require("./fileSystem")
var logger = require("./logger")



var logDictSaver = {
	init: function() {
		this.fs = fs
		this.logger = logger

		this.default = {
			"dir": "./",
			"logNameSuffix": "log.json",
			"dataNameSuffix": "data.json",
			"filename": null
		}
		this.logData = {}
		this.data = []
	},
	setup: function(params) {
		var tailSlash = params.dir.substr(-1, 1) === "/" ? "" : "/",
			dir = params.dir + tailSlash,
			filename = params.filename || Date.now().toString(),
			logSuf = this.default.logNameSuffix,
			dataSuf = this.default.dataNameSuffix,
			dot = ".",
			logPath = dir + filename + dot + logSuf,
			dataPath = dir + filename + dot + dataSuf

		this.updateDefault("dir", dir)
		this.updateDefault("filename", filename)
		this.updateDefault("logPath", logPath)
		this.updateDefault("dataPath", dataPath)
		this.updateThatParams(params)
	},
	updateDefault: function(key, val) {
		this.default[key] = val
	},
	updateThatParams: function(params) {
		params.logPath = this.default.logPath
		params.dataPath = this.default.dataPath
	},
	// log's content is one JSON wrapper
	readLog: function(path) {
		var p = path ? path : this.default.logPath
		var content = this.fs.readFileSync(p, {"encoding": "utf8"})
		return content ? JSON.parse(content) : false
	},
	// data's content is one JSON wrapper each line
	readData: function(path) {
		var p = path ? path : this.default.dataPath
		var content = this.fs.readFileSync(p, {"encoding": "utf8"})
		// get data from each line
		var datas = content.match(/^(\{.+\})\s*$/igm)
		if (!datas) {
			return false
		}
		var res = [],
			val
		for (var i = 0; i < datas.length; i++) {
			val = datas[i]
			res.push(JSON.parse(val))
		}
		return res
	},
	// setParams: function(dict) {
	// 	this.logData.params = dict
	// },
	setLog: function(dict) {
		this.logData = dict
	},
	addData: function(dict) {
		// this.countPlus()
		this.data.push(dict)
	},
	save: function() {
		this.saveLog()
		this.saveData()
	},
	saveLog: function() {
		// console.log("this.logData:", this.logData)
		var content = JSON.stringify(this.logData)
		// console.log("content:", content)
		// this.fs.writeFile(this.default.logPath, content, this._errorProbe(""))
		this.fs.writeFileSync(this.default.logPath, content)
	},
	saveData: function() {
		var content = JSON.stringify(this.data)
		// this.fs.writeFile(this.default.dataPath, content, this._errorProbe(""))
		this.fs.writeFileSync(this.default.dataPath, content)
	},
	appendData: function(dict) {
		var content = JSON.stringify(dict) + "\n"
		// this.fs.appendFile(this.default.dataPath, content, this._errorProbe(""))
		this.fs.appendFileSync(this.default.dataPath, content)
	},
	_errorProbe: function(errMsg, succMsg) {
		return function(err) {
			if (err) {
				//this.logger.error(errMsg)
			} else {
				if (succMsg) {
					//this.logger.log(succMsg)
				}
			}
		}.bind(this)
	}
}

logDictSaver.init()
module.exports = logDictSaver