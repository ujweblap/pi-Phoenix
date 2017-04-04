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

.directive('typeNumber', function () {
	return {
		resolve: "A",
		scope: {
			"typeName": '=',
			"typeData": '=',
			"globalConfig": '='
		},
		templateUrl: "html/types/Number.html"
	}
})

.directive('typeCheckbox', function () {
	return {
		resolve: "A",
		scope: {
			"typeName": '=',
			"typeData": '=',
			"globalConfig": '='
		},
		templateUrl: "html/types/Checkbox.html"
	}
})

.directive('typeSelect', function () {
	return {
		resolve: "A",
		scope: {
			"typeName": '=',
			"typeData": '=',
			"globalConfig": '='
		},
		controller: typeSelectCtrl,
		templateUrl: "html/types/Select.html"
	}
})

.directive('typePreview', function () {
	return {
		resolve: "A",
		scope: {
			"typeName": '=',
			"typeData": '=',
			"globalConfig": '='
		},
		templateUrl: "html/types/Preview.html"
	}
})

.controller('dronAppCtrl', dronAppCtrl);

/* CONTROLLERS */

function dronAppCtrl($scope, $http, socket) {
	$scope.app = {
		route: 'index',
		recording: false,
		live_preview: false,
		show_preview: false,
		config: {
			width: 1280,
			height: 720,
			framerate: 60
		}
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

	socket.on('init:presets', function (presets) {
		console.log(presets);
		$scope.app.presets = presets;
	});

	socket.on('error:init:videos', function (err) {
		console.log("ERROR loading videos", err);
	});

	socket.on('error:init:presets', function (err) {
		console.log("ERROR loading presets", err);
	});

	socket.on('converting_finished', function (newSrc) {
		$scope.videos.srcs.push(newSrc);
	});

	$scope.changeRoute = function (route) {
		$scope.app.route = route;
	};

	$scope.recordingConfig = function() {
		var conf = [];
		for (config_key in $scope.app.config) {
			if ($scope.app.config.hasOwnProperty(config_key) && $scope.app.config[config_key] !== false && $scope.app.config[config_key] !== "" && $scope.app.config[config_key] !== null) {
				conf.push('--'+config_key);
				if ($scope.app.raspivid[config_key]["type"] === "Number" || $scope.app.raspivid[config_key]["type"] === "Select" || $scope.app.raspivid[config_key]["type"] === "Preview") {
					conf.push($scope.app.config[config_key]);
				}
			}
		}
		return conf;
	}
}

function appIndexCtrl($scope) {

}

function videoRecorderCtrl($scope, socket, $http) {
	$scope.app.selected_preset = 'preset/default.json';
	$scope.app.preset = {};
	$scope.startRecording = function(){
		$scope.app.recording = true;
		socket.emit('start_recording', $scope.recordingConfig());
	};
	$scope.stopRecording = function(){
		$scope.app.recording = false;
		socket.emit('stop_recording');
	};
	$scope.getPresetName = function(preset_file) {
		return preset_file.replace('.json', '').replace('preset/', '');
	};
	$scope.loadPreset = function(preset_file) {
		$http.get(preset_file).then( function (preset) {
			$scope.app.preset = {
				saved: true,
				name: $scope.getPresetName(preset_file)
			};
			$scope.app.config = preset.data;
		});
	};

	$scope.loadPreset($scope.app.selected_preset);
}

function photoCaptureCtrl($scope, socket) {

}

function fileBrowseCtrl($scope, socket) {
	$scope.playVideo = function(src) {
		$scope.app.play_src = src;
		$scope.app.play = true;
	};
	$scope.closeVideo = function () {
		$scope.app.play = false;
	};
}

function typeSelectCtrl($scope) {
	if (!$scope.globalConfig.hasOwnProperty($scope.typeName)) {
		$scope.globalConfig[$scope.typeName] = false;
	}
}