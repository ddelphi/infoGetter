/*
	fileSystem

	Simple wrapping the fs module of nodejs
*/

var fs = require("fs")



var fileSystem = {}

// decorator the fs and then attach them to fileSystem object
for (var fn in fs) {
	if (!fs.hasOwnProperty(fn)) continue
	if (typeof fs[fn] === "function") {
		fileSystem[fn] = (function() {
			var mFn = fn
			return function() {
				try {
					return fs[mFn].apply(fs, arguments)
				} catch(e) {
					console.error("fileSystem error in method '%s'.".replace("%s", mFn))
					console.error(e)
				}
			}
		})()
	}
}


module.exports = fileSystem