'use strict';

require(['./mmRequest', 'domReady!'], function(avalon) {

	var corssDomain = '//127.0.0.1:9000';

	var vmodel = avalon.define({
		$id: 'demo',

		// serialize
		serializeStr: '',
		serialize: function(){

			var str = avalon.serialize(document.getElementById('test-form'));

			avalon.log(str);
			vmodel.serializeStr = str;
		},

		// ajax
		state: {
			text: '无请求',
			setSend: function(sendType) {
				vmodel.state.text = sendType + ' 请求中...';
			},
			setSucc: function(data) {
				vmodel.state.text = '请求成功！请求类型：' + data.sendType;
			}
		},

		// get
		get: function() {
			var sendType = 'avalon.get';
			vmodel.state.setSend(sendType);

			avalon.get('/api', {
				sendType: sendType,
				arr: ['html', 'css', 'js']
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		ajaxGet: function() {
			var sendType = 'type 为 \'get\' 的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/api',
				type: 'get',
				cache: false,
				data: {
					sendType: sendType
				}
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},

		// post
		post: function() {
			var sendType = 'avalon.post';
			vmodel.state.setSend(sendType);

			avalon.post('/api?age=12', {
				sendType: sendType
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		ajaxPost: function() {
			var sendType = 'type 为 \'post\' 的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/api',
				type: 'post',
				data: {
					sendType: sendType
				}
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},

		// upload
		upload: function() {
			var sendType = 'avalon.upload',
				formData = new FormData();

			formData.append('sendType', sendType);
			vmodel.state.setSend(sendType);

			avalon.upload('/api?age=12', formData, {
				name: 'avalon'
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		ajaxUpload: function(){
			var sendType = '拥有 form 的 avalon.ajax',
				formData = new FormData();

			formData.append('sendType', sendType);
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/api',
				form: formData,
				data: {
					name: 'avalon'
				},
				type: 'post'
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},

		// getJSON
		getJSON: function() {
			var sendType = 'avalon.getJSON';
			vmodel.state.setSend(sendType);

			avalon.getJSON('/api', {
				sendType: sendType
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		ajaxGetJSON: function() {
			var sendType = 'dataType 为 \'json\' 的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/api',
				data: {
					sendType: sendType
				},
				dataType: 'json',
				cache: false
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},

		// getScript
		getScript: function() {
			var sendType = 'avalon.getScript';
			vmodel.state.setSend(sendType);

			avalon.getScript('/js/test.js', function() {
				avalon.log(arguments)
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc({
					sendType: sendType
				});
			});
		},
		ajaxGetScript: function(){
			var sendType = 'dataType 为 \'script\' 的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/js/test.js',
				data: {
					sendType: sendType
				},
				dataType: 'script',
				cache: false
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc({
					sendType: sendType
				});
			});
		},
		ajaxGetScriptNoDataType: function(){
			var sendType = '未设置 dataType 的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: '/js/test.js',
				data: {
					sendType: sendType
				}
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc({
					sendType: sendType
				});
			});
		},

		// 跨域
		corsAjax: function(){
			var sendType = '使用 jsonp 跨域的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: corssDomain + '/jsonp',
				data: {
					sendType: sendType
				},
				dataType: 'jsonp',
				cache: false
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		corsGetJSON: function() {
			var sendType = '通过 url 后缀识别跨域的 avalon.getJSON';
			vmodel.state.setSend(sendType);

			avalon.getJSON(corssDomain + '/jsonp?callback=?', {
				sendType: sendType
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},
		corsAjaxGetJSON: function() {
			var sendType = '通过 url 后缀识别跨域的 avalon.ajax';
			vmodel.state.setSend(sendType);

			avalon.ajax({
				url: corssDomain + '/jsonp?callback=?',
				data: {
					sendType: sendType
				},
				dataType: 'json',
				cache: false
			}).done(function(res) {
				avalon.log(res);
				vmodel.state.setSucc(res);
			});
		},

		// promise
		promiseDone: function() {
			avalon.ajax({
				url: '/api',
				type: 'get',
				cache: false,
				data: {
					test: 'send me back'
				},
				success: function() {
					avalon.log('success')
				}
			}).done(function() {
				avalon.log('done-1')
				avalon.log(arguments);
			}).always(function() {
				avalon.log('always-1')
				avalon.log(arguments)
			}).done(function() {
				avalon.log('done-2')
			}).fail(function() {
				avalon.log('fail')
			}).always(function() {
				avalon.log('always-2')
				avalon.log(arguments)
			});
		},
		promiseFail: function() {
			avalon.ajax({
				url: '/err',
				type: 'get',
				cache: false,
				data: {
					test: 'send me back'
				},
				error: function() {
					avalon.log('error')
				}
			}).always(function() {
				avalon.log('always-1')
				console.log(arguments)
			}).done(function() {
				avalon.log('done')
				avalon.log(arguments);
			}).fail(function() {
				avalon.log('fail-1')
				console.log(arguments)
			}).fail(function() {
				avalon.log('fail-2')
				console.log(arguments)
			}).always(function() {
				avalon.log('always-2')
				console.log(arguments)
			});
		},

		// 全局事件
		bindGlobalEventHandlers: function() {
			console.log('已绑定全局事件')

			var ajaxGlobalEvents = avalon.ajaxGlobalEvents

			ajaxGlobalEvents.start = function() {
				console.log('g---start')
			}
			ajaxGlobalEvents.send = function() {
				console.log('g---send', arguments)
			}
			ajaxGlobalEvents.success = function() {
				console.log('g---success', arguments)
			}
			ajaxGlobalEvents.error = function() {
				console.log('g---error', arguments)
			}
			ajaxGlobalEvents.complete = function() {
				console.log('g---complete', arguments)
			}
			ajaxGlobalEvents.stop = function() {
				console.log('g---stop')
			}
		}




	});

	avalon.scan();
});
