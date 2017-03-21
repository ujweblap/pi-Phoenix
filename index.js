var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);

function handler (req, res) {
	var req_file = req.url;
	if (req.url === '/') {
		req_file = '/index.html';
	}
	fs.exists(__dirname + '/view'+req_file, function (exist) {
		console.log('file '+(exist?'':'NOT')+' exists', req_file);
		if (!exist) {
			req_file = '/index.html';
			res.writeHead(404);
			return res.end();
		}
		fs.readFile(__dirname + '/view' + req_file,
			function (err, data)
			{
				if (err) {
					res.writeHead(500);
					return res.end('Error loading index.html');
				}

				res.writeHead(200);
				res.end(data);
			}
		);
	});
}

io.on('connection', function (socket) {
	console.log('Got socket connection');
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});