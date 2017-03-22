


angular.module('dronApp', [
	'btford.socket-io'
])

.factory('socket', function (socketFactory) {
	return socketFactory();
})

.controller('cameraRecorderCtrl', cameraRecorderCtrl);

	function cameraRecorderCtrl($scope, socket) {

		$scope.dron = {};

		/*
		*/

		$scope.startRecording = function(){			
			socket.emit('start_recording', function (news) {
				$scope.dron.news = news;
			});
		}
		$scope.stopRecording = function(){
			socket.emit('stop_recording', function (news) {
				$scope.dron.news = news;
			});			
		}

		socket.on('news', function (news) {
			$scope.dron.news = news;
		});



	}