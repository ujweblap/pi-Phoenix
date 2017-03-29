angular.module('dronApp', [
	'btford.socket-io'
])

.factory('socket', function (socketFactory) {
	return socketFactory();
})

/* DIRECTIVES */

.directive('appIndex', function () {
	return {
		resolve: "A",
		controller: appIndexCtrl,
		templateUrl: "html/app-index.html"
	};
})

.directive('videoRecorder', function () {
	return {
		resolve: "A",
		controller: videoRecorderCtrl,
		templateUrl: "html/video-recorder.html"
	};
})

.directive('photoCapture', function () {
	return {
		resolve: "A",
		controller: photoCaptureCtrl,
		templateUrl: "html/photo-capture.html"
	};
})

.directive('fileBrowse', function () {
	return {
		resolve: "A",
		controller: fileBrowseCtrl,
		templateUrl: "html/file-browse.html"
	};
})

.controller('dronAppCtrl', dronAppCtrl);

/* CONTROLLERS */

function dronAppCtrl($scope, $http, socket) {
	$scope.app = {
		route: 'index',
		recording: false,
		live_preview: false,
		show_preview: false
	};
	$scope.videos = {
		srcs: []
	};

	$http.get('raspivid.json').then(
		function (respividjson) {
			$scope.app.raspivid = respividjson.data;
			$scope.app.raspivid_loaded = true;
		}, function (err) {
			console.log('loading respivid.json error', err);
		}
	);

	socket.on('init:videos', function (videos_src) {
		$scope.videos.srcs = videos_src;
	});

	$scope.changeRoute = function (route) {
		$scope.app.route = route;
	};
}

function appIndexCtrl($scope) {

}

function videoRecorderCtrl($scope, socket) {
	$scope.startRecording = function(){
		socket.emit('start_recording');
	};
	$scope.stopRecording = function(){
		socket.emit('stop_recording');
	};

	socket.on('converting_finished', function (newSrc) {
		$scope.videos.srcs.push(newSrc);
	});
}

function photoCaptureCtrl($scope, socket) {

}

function fileBrowseCtrl($scope, socket) {

}
