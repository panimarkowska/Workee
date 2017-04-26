if (typeof app == 'undefined') {
	app = {};
}
function init() {
    workee = workeeApi()
	var onDeviceReady = function onDeviceReady() {
		app.showUserDetail(102);
	}
	document.addEventListener("deviceready",onDeviceReady, false);

}

app.showUserDetail = function (id) {
	var users = workee.getUser(id);
	document.getElementById("deviceDetails").innerHTML = users.name + ' ' + users.surname ;
}

app.login = function (){
    var loginValue = document.getElementById("loginValue").value;
    var passwordValue = document.getElementById("passwordValue").value;

    if (loginValue.length>0 && passwordValue.length>0){
    var data = workee.login(loginValue, passwordValue);

    if (data.isLogged){
        location.hash = "newsPage";
    } else {
        alert("Bledny login lub haslo!");
    }

    } else{
    alert("Fill in!")
    }
}