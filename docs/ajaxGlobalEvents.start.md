.ajaxGlobalEvents.start()
===

**Description:** A funtion called when the first Ajax request begins.

avalon.ajaxGlobalEvents.start()

Whenever an Ajax request is about to be sent, mmRequest checks whether there are any other outstanding Ajax requests. If none are in progress, mmRequest execute the `.ajaxGlobalEvents.start()` event.