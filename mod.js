/*
	mod

	The main module for fetching content from web and other actions
*/

var _ = require("underscore")
var fetcher = require("fetch")
var netTools = require("./lib/netTools")
var stringTools = require("./lib/stringTools")
var dictSaver = require("./lib/dictSaver")
var eventSystem = require("./lib/eventSystem")
var counterStop = require("./lib/counterStop")
var miniEvent = require("./lib/miniEvent")
var logger = require("./lib/logger")
var consolex = require("./lib/consolex")
var options = require("./options")



var mod = miniEvent.extend({
	init: function() {
		this.netTools = netTools
		this.stringTools = stringTools
		this.dictSaver = dictSaver
		this.counterStop = counterStop
		this.fetcher = fetcher
		this.logger = logger

		this.formFilename = formFilename
		// this.checkEnd = checkEnd
		// this.dealWithData = dealWithData
		// this.updateNextUrl = updateNextUrl

		this.__name__ = ""
		this.default = null
		this.status = {
			"stop": false,
			"skip": false
		}
		// this.error = []
		this.initParams()
		this.fetchCount = this.counterStop.newCounterLoop(this.default.retry)
	},

	/* deal with params */

	initParams: function() {
		this.default = options.mod.default
	},
	setupParams: function(params) {
		var flag = this.reloadParams(params)
		if (!flag) {
			this.setupDefaultParams(params)
		}
	},
	setupDefaultParams: function(params) {
		// perserve origin params
		this.originParams = params
		// only using the runtime params
		this.params = _.extend({}, this.default, params)

		// setup the necessary params
		this.updateParams("currentUrl", params.url)
		this.formFilename.form(this.params)
		// setup dictSaver
		this.dictSaver.setup(this.params)
		this.saveLog()
	},
	reloadParams: function(params) {
		var iParams = _.extend({}, params)
		if (iParams.continue === true
			|| options.mod.autoContinue === true) {
			delete iParams.continue

			this.formFilename.form(iParams)
			this.dictSaver.setup(iParams)
			var log = this.dictSaver.readLog()
			if (log) {
				this.originParams = log.params
				this.params = log.log
				return true
			}
		}
		return false
	},
	setOutputObject: function(obj) {
		this.dictSaver = obj
	},
	saveLog: function() {
		this.updateParams("date", (new Date()).toISOString())
		this.dictSaver.setLog({
			"params": this.originParams,
			"log": this.params,
			"info": this.logger.get("log"),
			"error": this.logger.get("error")
		})
		this.dictSaver.saveLog()
	},
	// logger.error: function(/*args*/) {
	// 	var args = Array.prototype.slice.call(arguments)
	// 	args.unshift((new Date()).toISOString())
	// 	this.error.push(args.join(", "))
	// },

	/* update something */

	updateParams: function(k, v) {
		if (_.isString(k)) {
			this.params[k] = v
		} else if (_.isObject(k)) {
			_.extend(this.params, k)
		}
	},
	updateTitle: function(content) {
		var pat = /<title>(.+?)<\/title>/,
			res = content.match(pat),
			title = res ? res[1] : ""
		this.updateParams("title", title)
	},

	/* deal with stop or skip */

	stop: function() {
		consolex.log("stop()")
		this.logger.error("stoped.")
		this.status.stop = true
	},
	isStop: function() {
		return this.status.stop ? true : false
	},
	resetStop: function() {
		consolex.log("resetStop()")
		this.status.stop = false
	},
	skip: function() {
		consolex.log("skip()")
		this.status.skip = true
	},
	isSkip: function() {
		return this.status.skip
	},
	resetSkip: function() {
		consolex.log("resetSkip()")
		this.status.skip = false
	},
	
	/* pipe process methods */
	
	addAction: function(callback) {
		this.register("action", callback)
	},
	process: function(res) {
		var actions = this.events["action"]
		for (var i = 0; i < actions.length; i++) {
			res = actions[i].call(null, res)
			
			if (this.isStop()) {
				this.resetStop()
				return false
			}
			if (this.isSkip()) {
				this.resetSkip()
				return true
			}
		}
		return true
	},
	
	/* 1: get info */
	
	getInfo: function() {
		var self = this,
			flag = true,
			res = {
				"core": self,
				"params": self.params,
				"content": ""
			}
		self.fetch(self.params, function(content) {
			if (content === false) { return }
			res.content = content
			self.updateTitle(content)

			// main process
			flag = self.process(res)
			if (!flag) { return }

			// tail actions
			self.saveLog()
			self.getInfo()
		})
	},

	/* 1.1: fetch url */

	fetch: function(params, callback) {
		// return content or false if get http status error
		var self = this,
			url = params.currentUrl,
			fetchOptions = params.fetchOptions

		var complete = function(err, meta, body) {
			// try N times, for one url
			if (!err && self.fetchCount()) {
				if ([200, 304].indexOf(meta.status) === -1) {
					consolex.error("http meets 404 error, then retrying...")
					self.fetch(params, callback)
				} else {
					consolex.log("fetch okay. with url: %s".replace("%s", url))
					self.logger.log("fetch okay. with url: %s".replace("%s", url))
					// reset fetch count
					self.fetchCount(true)
					callback(body.toString())
				}
			} else {
				consolex.error("fetch error or http 404. with url: %s".replace("%s", url))
				self.logger.error("fetch error or http 404. with url: %s".replace("%s", url))
				self.logger.error("fetch error: ", err)
				self.updateParams("errorUrl", url)
				callback(false)
			}
		}
		self.fetcher.fetchUrl(url, fetchOptions, complete)
	},
	perform: function(params) {
		this.setupParams(params)
		this.getInfo()
	}
})


// form the filename of the params
// just using the url as the filename
var formFilename = {
	formFilename: function(params) {
		if (params.filename) return

		var filename = this.normalUrl(params.url)
		params.filename = filename
	},
	normalUrl: function(url) {
		url = url.replace(/[:\/]/ig, "_")
		var pattern = /[\d\w+-=_]/ig
		var match = url.match(pattern) || []
		return match.join("")
	},
	form: function(params) {
		this.formFilename(params)
	}
}

/* belows are actions */


var checkEnd = {
	init: function() {
		this.status = {
			"errorCount": 0
		}

		this.checkCount = counterStop.newCounterStop(6)
		this.initParams()
	},
	initParams: function() {
		this.default = options.checkEnd.default
	},
	checkEnd: function(income) {
			var core = income.core
			var content = income.content
			var params = income.params

			// break point
			var errFlag = false
			if (this.isToEndPoint(params)) {
				consolex.log("comes to end point. with url: ", params.currentUrl)
				logger.log("fetching has been done. with url: ", params.currentUrl)
				errFlag = true
			}
			// http 404 or something else
			// to stop when error counts more than N
			// this is for checking the errors of different url, comparing to the retry of mod.fetch()
			if (this.isError(content)) {
				consolex.error("has error in getting page. with url: ", params.currentUrl)
				logger.error("fetching error. with url: ", params.currentUrl)
				errFlag = true
			}
			if (errFlag) {
				core.stop()
			}
	},
	isToEndPoint: function(params) {
		if (!params.endPoint || !params.endPointPattern) { return }

		var pattern = params.endPointPattern,
			endPoint = params.endPoint,
			url = params.currentUrl

		var match = url.match(pattern),
			p1 = match ? match[1] : null
		return endPoint === p1 ? true : false
	},
	isError: function(content) {
		// double safe for infinity loop
		if (!this.checkCount()) {
			consolex.error("stop on retrying too many times.")
			return true
		}
		// come error from fetching url
		if (content === false) {
			if (this.countError(true)) {
				return true
			} else {
				// skip the rest action in the current pipe loop or core object
				// core.skip()
			}
		}
		return false
	},
	countError: function(errFlag) {
		if (errFlag) {
			this.status.errorCount += 1
		}
		if (this.status.errorCount >= this.default.errorLimit) {
			return true
		}
		return false
	},
	execute: function(income) {
		this.checkEnd(income)
		return income
	}
}



var dealWithData = {
	dealWithData: function(income) {
		var content = income.content
		var params = income.params
		var core = income.core

		// when comes error in fetching url
		if (!content) { return }

		var data = this.getData(content, params.dataModel)
		// console.log("typeof data:", toString.call(data))
		// console.log("data:", data)
		// process.exit()
		// console.log("data:", data)
		this.updateDataDict(params, data)
		this.appendData(core, data)
	},
	getData: function(content, dataModel) {
		eventSystem.trigger("onGetData", {
			"content": content,
			"dataModel": dataModel
		})
		var res = stringTools.mapHtmlString(content, dataModel)
		return res
	},
	updateDataDict: function(params, dict) {
		dict._url_ = params.currentUrl
	},
	appendData: function(core, dict) {
		// save every time
		// or, save within N time
		core.dictSaver.appendData(dict)
	},
	execute: function(income) {
		// console.log("dealWithData execute()")
		this.dealWithData(income)
		return income
	}
}

var updateNextUrl = {
	updateNextUrl: function(income) {
		var content = income.content
		var core = income.core
		var params = income.params

		var fetchParams = {
			"url": params.currentUrl,
			"nextPattern": params.nextPattern,
			"content": content
		}
		eventSystem.trigger("nextUrl/prev", fetchParams)
		var newUrl = netTools.getNextUrl(fetchParams)
		eventSystem.trigger("nextUrl/post", fetchParams)
		core.updateParams("currentUrl", newUrl)
		this.checkNextUrl(core,newUrl)
	},
	checkNextUrl: function(core, url) {
		if (!url) {
			core.stop()
		}
	},
	execute: function(income) {
		this.updateNextUrl(income)
		return income
	}
}


mod.init()
checkEnd.init()
mod.addAction(checkEnd.execute.bind(checkEnd))
mod.addAction(dealWithData.execute.bind(dealWithData))
mod.addAction(updateNextUrl.execute.bind(updateNextUrl))

module.exports = mod