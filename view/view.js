angular.module('dronApp', [
	'btford.socket-io'
])
.factory('socket', function (socketFactory) {
	return socketFactory();
})
.controller('dronCtrl', function ($scope, socket) {
	$scope.dron = {
		name: 'PiOnDron'
	};

	socket.on('news', function (news) {
		$scope.dron.news = news;
	});
});