# Infogetter - readme

## overview

This is the simple web content grasper script written in nodejs.

The main feature of the script is to map the specify content to a dict, using jquery like selector.

## prepare

First, you should use the npm tool to install the nessary node package of this script.

You can use this command to install it:
	
	npm install

## example

There is an example folder in the project, you can view the example codes to see how it works.

## basic

You can run the script by passing the params to the perform() function, which is in the required object with mod_article.js file. After finishing the running, you will finally get two files, the log file and the data file.

the basic params should be:

	'''javascript
	{
		continue: false
		
		url: ""
		nextPattern: ""
		endPointPattern: ""
		endPoint: ""
		dataModel: ""
	}
	'''

The url, is the url of the target page.

The nextPattern, is the javascript code for getting the next page's url. The program will eval it and then get the return result form it. You can use variable "url" or "content" to get the nessary info to construct the next page's url. The variable "url" means the current url, and the "content" means the current page's content. Because the code are in string form, some transform tag should be transform, like \d to \\d.

The endPointPattern, is the regexp code in string form for matching the specify text of the url, then the program will use it to stop the process. The program will use the first matching group or the whole matching text as the final matching text (for the endPoint key).

The endPoint, is for the program to match the final matching text, to stop the process.

The dataModel, is a dict type for getting the specify contents from the page.

## usage (use in your program)

You can simply require the file "mod_article.js" in your program, then pass the params to the perform() method of the required object.

After the perform() process has done, there will be two files saved in current working directory or the directory specified, the log file and the content data file.

If you want to get the specified content then deal with your program, you can follow the instructions below.

First, build your custom duck type object according to the dictSaver structure:
	dictSaver:
		*setup()
		
		readLog()
		readData()
		
		*setLog(dict)
		addData(dict)

		save()
		*saveLog()
		saveData()
		*appendData(dict)

The important methods you must implement are those methods with a * character at the first of the word.

the setLog() method will be passed in the log datas.

the appendData() method will be passed in each page's mapped content.

the setup() and saveLog() method can be dumb methods.

Finally, you can require the "mod_article.js" script to your program (eg. as MA object), then pass your custom dictSaver like object to MA.setOutputObject() method.

After that, you can pass the params to MA.perform() method to fetch the page, and the MA object will pass the log and data content to your custom dictSaver, to let you deal with them.

## dataModel

The main feature of the mapping content function of the program, is to map the text content of the web page. But if you want to get the origin source code of the matching content, you should adding a prefix "(html)" to the first place of the selector.

For example:

	"title": "(html) .title"

Then, let's look inside the dataModel.

First, let's look at the example of dataModel:

	'''javascript
	{
		"*": ".item",
		"[]": {
			"title": ".title",
			"desc": ".desc"
		}
	}
	'''

Let's introducing the syntax of the dataModel.

The "*" key's value is the jquery selector, and the others are all the custom selector.

The key-value pairs under the "[]" key, are used for select the content from each jquery item object got from the "*" part. The "*" key's value also means that it will act as the target content, for those other keys in the same level.

The syntax of custom selector:

	jquerySelector -> [attribute] [[replacement]] || ...

	the "jquerySelector" part is for selecting the specify content.

	The "-> [attribute]" part is for getting the attribute's value.

	The "[[replacement]]" part is for replacing the text got by the pervious selector. The replacement string pattern should be:

		/regexString/, 'replacement string'

	The "||" part is for seprating different selector. You can insert custom string between the two "|" character, the string will show as the part of the final text.

For example:

	{
	"title": ".title -> [title] [[/info:/, '']]"
	}

## notice

Because the program using the node module cheerio to select the content, so some jquery custom psuedo elements used in selector will not support, such as :eq(n), ect.

