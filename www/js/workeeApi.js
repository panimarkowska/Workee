workeeApi = function () {
    var requestAction = function (actionName, params, successCallback, errorCallback) {
        app.showLoadingPage();
    	var mockAction = app.debugMode.getMock(actionName);
        if (app.debugMode.isMock && mockAction !== null) {
            setTimeout(function(){
                successCallback(mockAction);
                app.hideLoadingPage();
            }, 1000)
        } else {

            return $.ajax({
                url: 'http://workee.mytool.pl/' + actionName,
                data:  params,
                method: "POST",
                success: function (data) {
                    debugger
                    if (data) {
                        successCallback && successCallback(data);
                    } else {
                        app.debugMode.error('WorkeeApi: data.status: ' + data.status, data);
                        return null;
                    }
                    app.hideLoadingPage();
                },
                error: function (data) {
                    // app.debugMode.error('WorkeeApi: error ' + actionName + ' action', data);
                    app.hideLoadingPage();
					return null;
                }
            });
        }
    };

    var getUser = function (id, successCallback) {
    	if (id) {
			var param = {id : id};
			return requestAction('getUser', param, successCallback);
		} else {
    		app.debugMode.log('WorkeeApi: method getUser require parameters')
		}
    };

     var login = function (emailValue, passwordValue, successCallback) {
        var params = {
            username : emailValue,
            password : passwordValue
            };
        return requestAction('login', params, successCallback);
    };

    var isLogged = function (isLogged, notLoged) {
        return requestAction('isLogged', null, function (data) {
            if (data.isLogin) {
                isLogged();
            } else {
                notLoged();
            }
        });
    };

	var getUsers = function (cb) {
		return requestAction('getUsers', null,  cb);
    };

    var register = function (registerParams, data){
        requestAction('register', registerParams);
    };

    return {
    	getUser : getUser,
    	getUsers : getUsers,
    	login : login,
    	isLogged : isLogged,
    	register : register
	}
}