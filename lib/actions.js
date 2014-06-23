
/*
	actions
	
	The action base object
*/


var action = {
	init: function() {
		this.collection = []
	},
	add: function(fn) {
		if (typeof fn !== "function") {
			return false
		}
		this.collection.push(fn)
		return this.collection.length - 1
	},
	remove: function(i) {
		if (this.collection[i]) {
			delete this.collection[i]
			return true
		}
		return false
	},
	execute: function(data) {
		var val
		for (var i = 0; i < this.collection.length; i++) {
			val = this.collection[i]
			if (typeof val === "undefined") continue
			val.call(null, data)
		}
	}
}


var actionGroup = {
	init: function() {
		this.collection = {}
	},
	add: function(k, fn) {
		if (typeof fn !== "function") {
			return false
		}
		this.collection[k] = this.collection[k] || []
		this.collection[k].push(fn)
		return [k, this.collection[k].length - 1]
	},
	remove: function(kid) {
		// [key, idx]
		var key = kid[0],
			idx = kid[1]
		if (!this.collection.hasOwnProperty(key)) return false
		
		var col = this.collection[key]
		delete col[idx]
	},
	execute: function(key, data) {
		if (!this.collection.hasOwnProperty(key)) return false
		var col = this.collection[key],
			val
		for (var k in col) {
			if (!col.hasOwnProperty(k)) continue
			val = col[k]
			val.call(null, data)
		}
	}
}


var actionFactory = {
	newAction: function() {
		return this._new(action)
	},
	newActionGroup: function() {
		return this._new(actionGroup)
	},
	_new: function(obj) {
		var newObj = Object.create(obj)
		newObj.init()
		return newObj
	}
}


module.exports = actionFactory


