/*
	mod_article

	Simple wrapping the mod module
*/

var mod = require("./mod")



var article = Object.create(mod)

article.init()
module.exports = article