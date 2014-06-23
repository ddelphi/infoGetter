
var mod_article = require("../mod_article")



var example = {
	start: function() {
		var ma = mod_article

		var params = {
			"url": "http://www.chromi.org/page/1",
			"nextPattern": "url.replace(/(\\d+)/, function(who, p1) {var m = p1 ? p1 : 1; return (parseInt(m) + 1)})",
			// "fetchOptions": {},
			"endPointPattern": "(\\d+)",
			"endPoint": "2",
			"dir": "./",
			"filename": "example_site",
			"dataModel": {
				"*": "#main .post",
				"[]": {
					"title": ".title",
					"url": ".title -> [href]"
				}
			}
		}

		ma.perform(params)
	}
}

example.start()