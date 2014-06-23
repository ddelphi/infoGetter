/*
	options

	The options for all
*/

var fs = require("./lib/fileSystem")
var _ = require("underscore")



var options = {
	"mod": {
		"configPath": "./config.cfg",
		"autoContinue": false,

		"default": {
			"type": "all",
			"url": null,
			"nextPattern": null,
			"endPointPattern": null,
			"endPoint": null,

			"currentUrl": null,
			"title": null,
			"category": null,

			"dataModel": null,

			// filename means the filename prefix
			"filename": null,
			"dir": "./",

			"retry": 2,
			"retryDelay": 3,		// not yet implemented
			"fetchOptions": {
				"headers": {
					"user-agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.634.0 Safari/534.16",
					"referer": ""
				}
			},
			"date": null,
			
			// set by program
			"logPath": null,
			"dataPath": null,

			"errorUrl": null,		// todo
			"info": null,
			"error": null
		}
	},
	"checkEnd": {
		"default": {
			"errorLimit": 2
		}
	},
	"consolex": {
		"canOutput": true
	}
}

var optionsManager = {
	init: function(options) {
		this.options = options

		this.getModOptions()
	},
	getModOptions: function() {
		var modDefault = this.options.mod.default
		var modConfigPath = this.options.mod.configPath
		var exist = fs.existsSync(modConfigPath)
		if (exist) {
			var data = fs.readFileSync(modConfigPath)
			_.extend(modDefault, data)
		}
	}
}

optionsManager.init(options)
module.exports = options