.ajaxGlobalEvents.stop()
===

**Description:** A function executed when all Ajax requests have completed.

avalon.ajaxGlobalEvents.stop(msXHR msXHR, Object ajaxOptions)

Whenever an Ajax request completes, mmRequest checks whether there are any other outstanding Ajax requests. If none remain, mmRequest execute the `.ajaxGlobalEvents.stop()` event.