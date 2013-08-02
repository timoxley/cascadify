var http = require('http');
var fs = require('fs');
var browserify = require('browserify');
var cascadify = require('../../../index.js')();

cascadify.add('./main.js');

http.createServer(function (req, res) {
	console.log(req.url);
	if (req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/css' });
		cascadify.bundle().pipe(res);
	}
}).listen(8080);
console.log('Listening on port 8080.');