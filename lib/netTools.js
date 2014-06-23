/*
	netTools

	The helper methods for the net
*/


var $ = require("cheerio")



var netTools = {
	/*
		the type of param dict:
			content
			nextPattern:: is an expression after return keyword, can use variables (url, content)
			nextUrl
	*/
	getNextUrl: function(dict) {
		var content = dict.content ? dict.content : "",
			nextPattern = dict.nextPattern || "null",
			url = dict.url

		var next = new Function("url, content", "return (%n);".replace("%n", nextPattern))

		var newNextUrl = next(url, content)
		// console.log("nextPattern, url:", nextPattern, url)
		// console.log("newNextUrl, next:", newNextUrl, next)
		// return newNextUrl ? newNextUrl : dict.url
		return newNextUrl ? newNextUrl : ""
	},
	absoluteUrlJquery: function($obj, baseUrl) {
		var attrMap = {
			"href": "[href]",
			"src": "[src]"
		}
		var $target,
			theUrl,
			finUrl,
			attrSelector
		for (var attr in attrMap) {
			attrSelector = attrMap[attr]
			$obj.find(attrSelector).each(function(i, target) {
				$target = $(target)
				theUrl = $target.attr(attr)

				if (theUrl.indexOf("http") !== 0) {
					finUrl = this.absoluteUrl_formatUrl(baseUrl, theUrl)
					$target.attr(attr, finUrl)
				}
			}.bind(this))
		}
	},
	absoluteUrl_formatUrl: function(baseUrl, tailUrl) {
		if (baseUrl.indexOf("http") !== 0) {
			baseUrl = "http://" + baseUrl
		}
		if (baseUrl[baseUrl.length - 1] !== "/") {
			baseUrl += "/"
		}
		if (typeof tailUrl === "undefined") return;
		
		var finUrl = baseUrl + tailUrl
		return finUrl
	}
}


module.exports = netTools