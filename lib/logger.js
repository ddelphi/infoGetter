/*
	logger

	The logging object
*/

var logger = {
	defaultSetting: {
		"spliter": " ",
		"trigger": {
			"log": true,
			"warn": true,
			"error": false
		}
	},
	init: function() {
		// console.log("init")
		this.messages = {
			"log": [],
			"warn": [],
			"error": []
		}
		this.events = {
			"log": [],
			"warn": [],
			"error": []
		}
	},
	log: function(/* args */) {
		// console.log("log")
		this._log("log", arguments)
	},
	warn: function(/* args */) {
		// console.log("warn")
		this._log("warn", arguments)
	},
	error: function(/* args */) {
		// console.log("error")
		this._log("error", arguments)
	},
	_log: function(type, args) {
		// console.log("_log")
		var msgs = Array.prototype.slice.call(args)
		var theMessage = {
			"time": (new Date()).toISOString(),
			"type": type,
			"message": msgs.join(this.spliter)
		}
		this.messages[type].push(theMessage)
		this.trigger(type, theMessage)
	},
	get: function(type, index) {
		// console.log("get")
		if (!this.messages[type]) return null;

		var length = this.messages[type].length
		if (typeof index === "number") {
			if (length < (index >= 0 ? index : -index)) return null;
			var idx = index >= 0 ? index : length + index
			// console.log("type idx:", type, idx)
			return this.messages[type][idx]
		} else if (typeof index === "undefined") {
			// console.log("type:", type)
			return this.messages[type]
		}
	},
	addListener: function(eventName, callback) {
		// console.log("addListener")
		if (!this.events[eventName]) {
			return false
		}
		this.events[eventName].push(callback)
	},
	trigger: function(eventName, datas) {
		if (!this.events[eventName]) return;
		if (!this.defaultSetting.trigger[eventName]) return false;
		var callbacks = this.events[eventName]
		for (var i in callbacks) {
			if (!callbacks.hasOwnProperty(i)) continue
			callbacks[i].call(null, datas)
		}
	},
	list: function(type, spliter) {
		// console.log("list")
		if (!this.messages.hasOwnProperty(type)) return null;
		spliter = typeof spliter === "string" ? spliter : this.spliter
		
		var res = []
		for (var logObj in this.messages[type]) {
			if (!this.messages[type].hasOwnProperty(logObj)) continue
			res.push(this.messages[type][logObj].message)
		}
		return res.join("\n")
	}
}

logger.init()
module.exports = logger
