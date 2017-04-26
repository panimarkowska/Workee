if (typeof app == 'undefined') {
	app = {};
}
function init() {
    workee = workeeApi()
	var onDeviceReady = function onDeviceReady() {
	    var cookies = document.cookie.split("; ");
	    for (var i=0; i<cookies.length; i++){
            if (cookies[i].indexOf("userLogged") != -1){
                var userLogged = cookies[i].split("=")[1];
                if (userLogged=="1"){
                    location.hash = "#newsPage";
                }
            }
	    }


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


    if (loginValue.length>0){
        if (passwordValue.length>0){
            var data = workee.login(loginValue, passwordValue);
            if (data.isLogged){
                document.cookie = "userLogged=1";
                location.hash = "#newsPage";
             }
        }
        else{
            alert("Invalid password.")
        }
    }
    else{
        alert("Invalid login.")
    }
}