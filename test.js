var events = require('events');
var sys = require('sys');
var http = require('http');
var fs = require('fs');

var TestApp = function() {
	var _self = this;
	var counter = 0;
	
	var routes = {
		'/' : function(request, response) {
			response.writeHead(200, {'Content-Type': 'text/html'});
			var string = _self.indexTemplate;
			response.write(string);
			response.end();
		},

		'/jsupdate' : function(request, response) {
			response.writeHead(200, {'Content-Type': 'text/javascript'});
			updateLoop.call(this, request, response, counter);
		},

		'/jsstatus' : function(request, response) {
			response.writeHead(200, {'Content-Type': 'text/javascript'});
			response.write('counter: ' + counter + '\n');
			response.end();
		},

		'/increment' : function(request, response) {
			response.writeHead(200, {'Content-Type': 'text/plain'});
			counter++;
			response.write('counter: ' + counter + '\n');
			response.end();
		},

		'/reset' : function(request, response) {
			response.writeHead(200, {'Content-Type': 'text/plain'});
			counter = 0;
			response.write('reset\n');
			response.end();
		}
	}

	var updateLoop = function(request, response, current_counter) {
		if(current_counter != counter) {
			response.write('counter: ' + counter + '\n');
			response.end();
			return false;
		}
		
		setTimeout(function() {
			updateLoop.call(this, request, response, current_counter);
		}, 1000);
	};

	var _requestHandler = function(request, response) {
		sys.puts('request: \'' + request.url + '\'');
		
		if(routes[request.url] === undefined) {
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('not found\n');
			response.end();
		} else {
			routes[request.url].call(this, request, response);
		}
	};
	
	var _updateHandler = function(request, socket, head) {
		sys.puts('update');
	};

	var _closeHandler = function() {
		sys.puts('close');
	};
	
	sys.puts('New TestApp');
	
	fs.readFile('./index.html', function (err, data) {
		if (err) throw err;
		_self.indexTemplate = data;
		sys.puts('Template loaded');
	});
	
	var _server = http.createServer().
					addListener('request', _requestHandler)
					.addListener('close', _closeHandler)
					.addListener('update', _updateHandler)
					.listen(8000);
	sys.puts('Listening to port 8000');
};

new TestApp();