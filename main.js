var Asteroid = require("asteroid");
var Q = require("q");
var fs = require("fs");

var STRESS_LEVEL = 50;

var belt = [];

for (var i=0; i<STRESS_LEVEL; i++) {
	belt[i] = new Asteroid("test.api.mondora.com");
}

var responseTimes = {};
var avgResponseTimes = {};
var promises = {};

belt.forEach(function (ast, index) {

	var connectedDeferred = Q.defer();
	promises.connected = promises.connected || [];
	promises.connected[index] = connectedDeferred.promise;

	var bc = Date.now();

	ast.on("connected", function () {



		var ac = Date.now();
		responseTimes.connected = responseTimes.connected || [];
		responseTimes.connected[index] = ac - bc;

		var allUsersSubDeferred = Q.defer();
		promises.allUsersSub = promises.allUsersSub || [];
		promises.allUsersSub[index] = allUsersSubDeferred.promise;

		var configurationsSubDeferred = Q.defer();
		promises.configurationsSub = promises.configurationsSub || [];
		promises.configurationsSub[index] = configurationsSubDeferred.promise;

		var postOneSubDeferred = Q.defer();
		promises.postOneSub = promises.postOneSub || [];
		promises.postOneSub[index] = postOneSubDeferred.promise;

		var postTwoSubDeferred = Q.defer();
		promises.postTwoSub = promises.postTwoSub || [];
		promises.postTwoSub[index] = postTwoSubDeferred.promise;

		connectedDeferred.resolve();



		var bs = Date.now();

		ast.subscribe("allUsers").ready.then(function () {
			var as = Date.now();
			responseTimes.allUsersSub = responseTimes.allUsersSub || [];
			responseTimes.allUsersSub[index] = as - bs;
			allUsersSubDeferred.resolve();
		});

		ast.subscribe("configurations").ready.then(function () {
			var as = Date.now();
			responseTimes.configurationsSub = responseTimes.configurationsSub || [];
			responseTimes.configurationsSub[index] = as - bs;
			configurationsSubDeferred.resolve();
		});

		ast.subscribe("singlePost", "03bd170e9f5916261ad4fc817b5b40e2").ready.then(function () {
			var as = Date.now();
			responseTimes.postOneSub = responseTimes.postOneSub || [];
			responseTimes.postOneSub[index] = as - bs;
			postOneSubDeferred.resolve();
		});

		ast.subscribe("singlePost", "844ec87af11d9ee224dc27a9f050495e").ready.then(function () {
			var as = Date.now();
			responseTimes.postTwoSub = responseTimes.postTwoSub || [];
			responseTimes.postTwoSub[index] = as - bs;
			postTwoSubDeferred.resolve();
		});



	});

});

Q.all(promises.connected).then(function () {
	console.log("All connected");

	Q.all([
		
		Q.all(promises.allUsersSub).then(function () {
			var sum = responseTimes.allUsersSub.reduce(function (prev, cur) {
				return prev + cur;
			}, 0);
			avgResponseTimes.allUsersSub = sum / STRESS_LEVEL;
		}),

		Q.all(promises.configurationsSub).then(function () {
			var sum = responseTimes.configurationsSub.reduce(function (prev, cur) {
				return prev + cur;
			}, 0);
			avgResponseTimes.configurationsSub = sum / STRESS_LEVEL;
		}),

		Q.all(promises.postOneSub).then(function () {
			var sum = responseTimes.postOneSub.reduce(function (prev, cur) {
				return prev + cur;
			}, 0);
			avgResponseTimes.postOneSub = sum / STRESS_LEVEL;
		}),

		Q.all(promises.postTwoSub).then(function () {
			var sum = responseTimes.postTwoSub.reduce(function (prev, cur) {
				return prev + cur;
			}, 0);
			avgResponseTimes.postTwoSub = sum / STRESS_LEVEL;
		})

	]).then(function () {
		var str = JSON.stringify(avgResponseTimes, null, 4);
		console.log(str);
		fs.writeFileSync("avgResponseTimes.json", "utf8");
	});

});