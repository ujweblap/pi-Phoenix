var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
const spawn = require('child_process').spawn;

var recording = false;
var videoFile_recording = null;
var videoConverted = null;
var spawn_recording;

app.listen(8080);
console.log('pi-Phoenix running on port 8080');

function handler (req, res) {
	var req_file = req.url;
	var req_dir = __dirname + '/view';
	if (req.url === '/') {
		req_file = '/index.html';
	}
	if (req.url.substr(0,7) === '/video/') {
		req_dir = __dirname;
	}

	fs.exists(req_dir + req_file, function (exist) {
		console.log('file '+(exist?'':'NOT')+' exists', req_file);
		if (!exist) {
			res.writeHead(404);
			return res.end();
		}
		fs.readFile(req_dir + req_file,
			function (err, data)
			{
				if (err) {
					res.writeHead(500);
					return res.end('Error loading ' + req_file);
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

	socket.emit('videos', []);

	socket.on('start_recording', function() {
		if (recording) {
			socket.emit('recording_error', 'Recording is already running');
			console.log('recording_error', 'Recording is already running');
			return;
		}
		recording=true;
		console.log('Recording started...');
		recordVideo();
		io.emit('recording_started');
	});
	socket.on('stop_recording', function () {
		if (!recording) {
			console.log('NOT FOUND recording');
			return;
		}
		recording = false;
		console.log('Recording stoped.');

		stopVideo();
		io.emit('recording_finished');

		io.emit('converting_started');

		convertVideo(videoFile_recording, function () {
			io.emit('converting_finished', 'video/'+videoConverted);
		});
	});
});

function recordVideo() {
	videoFile_recording = Date.now().toString() + '.h264';
	console.log('record video:', videoFile_recording, new Date().toISOString().replace(/\ /g, '_'));
	spawn_recording = spawn('raspivid', [
		'-t','0',
		'-w','1280',
		'-h','720',
		'-fps','60',
		'-b','4800000',
		'-p','0,0,1280,720',
		'-o', __dirname+ '/video/' + videoFile_recording
	]);
	spawn_recording.stdout.on('end', function () {
		console.log('recording stoped', videoFile_recording);
	})
}

function stopVideo() {
	console.log('kill spawn process');
	spawn_recording.kill();
}

function convertVideo(videoFile, cb) {
	videoConverted = videoFile.replace('.h264','.mp4');
	console.log('convert video:', videoFile);
	var spawn_convert = spawn('MP4Box', [
		'-add',
		'video/'+videoFile,
		'video/'+videoConverted,
		'-fps','60'
	]);
	spawn_convert.stdout.on('end', cb);
}