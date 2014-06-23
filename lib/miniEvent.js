/*
	miniEvent

	The mini event system base object
*/

var miniEvent = {
	init: function() {
		this.events = {}
	},
	register: function(k, fn) {
		if (typeof fn !== "function") {
			return false
		}
		this.events[k] = this.events[k] || []
		this.events[k].push(fn)
		return [k, this.events[k].length - 1]
	},
	remove: function(kid) {
		// [key, idx]
		var key = kid[0],
			idx = kid[1]
		if (!this.events.hasOwnProperty(key)) return false
		
		var col = this.events[key]
		delete col[idx]
	},
	trigger: function(key, data) {
		if (!this.events.hasOwnProperty(key)) return false
		var evts = this.events[key],
			val
		for (var k in evts) {
			if (!evts.hasOwnProperty(k)) continue
			val = evts[k]
			val.call(null, data)
		}
	},
	list: function(key) {
		var col,
			res = []
		if (typeof key === "string") {
			col = this.events[key]
			for (var i = 0; i < col.length; i++) {
				res.push(col[i])
			}
		} else {
			col = this.events
			for (var k in col) {
				if (!col.hasOwnProperty(k)) continue
				res.push(k)
			}
		}
		return res
	},
	extend: function(target) {
		var newObj = Object.create(this)
		newObj.init()

		for (var k in target) {
			if (!target.hasOwnProperty(k)) continue
			newObj[k] = target[k]
		}
		return newObj
	}
}

module.exports = miniEvent