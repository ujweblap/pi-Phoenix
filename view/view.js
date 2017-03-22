


angular.module('dronApp', [
	'btford.socket-io'
])

.factory('socket', function (socketFactory) {
	return socketFactory();
})

.controller('cameraRecorderCtrl', cameraRecorderCtrl);

	function cameraRecorderCtrl($scope, socket) {

		$scope.dron = {
			srcs: []
		};

		$scope.startRecording = function(){			
			socket.emit('start_recording');
		};
		$scope.stopRecording = function(){
			socket.emit('stop_recording');			
		};

		socket.on('videos', function (videos_src) {
			$scope.dron.srcs = videos_src;
		});

		socket.on('converting_finished', function (newSrc) {
			$scope.dron.srcs.push(newSrc);
		});



	}