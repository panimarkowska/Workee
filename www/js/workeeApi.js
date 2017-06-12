workeeApi = function () {
    var requestAction = function (actionName, params, callback, loadingPage) {
        if (loadingPage == false || typeof loadingPage == 'undefined') {
            app.showLoadingPage();
        }
    	var mockAction = app.debugMode.getMock(actionName);
        if (app.debugMode.isMock && mockAction !== null) {
            setTimeout(function(){
                callback(mockAction);
                app.hideLoadingPage();
            }, 1000)
        } else {

            return $.ajax({
                url: 'http://workee.mytool.pl/' + actionName,
                data:  params,
                method: "POST",
                success: function (data) {
                    if (data) {
                        if (data && data.length > 0) {
                            app.setInLocalStorage(actionName, data);
                        }
                        callback && callback(data);
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
			requestAction('getUser', param, successCallback);
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
	    var actionName = 'getUsers';
	    var isDataStorage = fillOutFromStorageData(actionName, cb);
		requestAction(actionName, null,  cb, isDataStorage);
    };

    var register = function (registerParams, data){
        requestAction('register', registerParams);
    };

    var fillOutFromStorageData = function (name ,callback){
        var storageData = app.getFromLocalStorage(name);
	    if (storageData) {
	        callback(storageData);
	        return true;
        }
        return false;
    };

    return {
    	getUser : getUser,
    	getUsers : getUsers,
    	login : login,
    	isLogged : isLogged,
    	register : register
	}
}