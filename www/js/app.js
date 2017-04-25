if (typeof app == 'undefined') {
	app = {};
}
function init() {
	var onDeviceReady = function onDeviceReady() {
		app.showUserDetail(102);
	}
	document.addEventListener("deviceready",onDeviceReady, false);

}

app.showUserDetail = function (id) {
	var workee = workeeApi()
	var users = workee.getUser(id);
	document.getElementById("deviceDetails").innerHTML = users.name + ' ' + users.surname ;
}