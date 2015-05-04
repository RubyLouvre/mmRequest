mmRequest API docs
==================

Basic function:

* [avalon.ajax()](avalon.ajax.md) - Perform an asynchronous HTTP (Ajax) request.

Shorthand functions:

* [avalon.get()](avalon.get.md) - Load data from the server using a HTTP GET request.
* [avalon.post()](avalon.post.md) - Load data from the server using a HTTP POST request.
* [avalon.upload()](avalon.upload.md) - Upload data to the server using a HTTP POST request.
* [avalon.getJSON()](avalon.getJSON.md) - Load JSON-encoded data from the server using a GET HTTP request.
* [avalon.getScript()](avalon.getScript.md) - Load a JavaScript file from the server using a GET HTTP request, then execute it.

Util functions:

* [avalon.param()](avalon.param.md) - Convert an object to a URL query string.
* [avalon.unparam()](avalon.unparam.md) - Convert a URL query string back to an object.
* [avalon.serialize()](avalon.serialize.md) - Convert a set of form elements to a string.

Global event functions:

* [.ajaxGlobalEvents.start()](ajaxGlobalEvents.start.md) - Register a handler to be called when the first Ajax request begins.
* [.ajaxGlobalEvents.send()](ajaxGlobalEvents.send.md) - Attach a function to be executed before an Ajax request is sent.
* [.ajaxGlobalEvents.success()](ajaxGlobalEvents.success.md) - Attach a function to be executed whenever an Ajax request completes successfully.
* [.ajaxGlobalEvents.error()](ajaxGlobalEvents.error.md) - Register a handler to be called when Ajax requests complete with an error.
* [.ajaxGlobalEvents.complete()](ajaxGlobalEvents.complete.md) - Register a handler to be called when Ajax requests complete.
* [.ajaxGlobalEvents.stop()](ajaxGlobalEvents.stop.md) - Register a handler to be called when all Ajax requests have completed.
