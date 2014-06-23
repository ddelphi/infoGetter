/*
	controller

	The controller for controlling apps
*/

var _ = require("underscore")

var controller = {
	app: {},

	addApp: function(name, object) {
		if (this.app.hasOwnProperty(name)) {
			throw new Error("already has the app '%s'.".replace("%s", name))
			return
		}
		this.app[name] = object
	},
	removeApp: function(name) {
		if (this.app.hasOwnProperty(name)) {
			delete this.app[name]
			return true
		}
		return false
	},
	performApp: function(name, datas) {
		if (this.app.hasOwnProperty(name)) {
			if (!_.isFunction(this.app[name].execute)) {
				throw new Error("app '%s' has not the exectue method.".replace("%s", name))
				return
			}
			this.app[name].execute(datas)
		}
	}
}

module.exports = controller