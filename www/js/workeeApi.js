workeeApi = function () {
    var requestAction = function (actionName, params, callback, loadingPage) {
        if (loadingPage == false || typeof loadingPage == 'undefined') {
            // app.showLoadingPage();
        }
    	var mockAction = app.debugMode.getMock(actionName);
        if (app.debugMode.isMock && mockAction !== null) {
            setTimeout(function(){
                callback(mockAction);
                // app.hideLoadingPage();
            }, 1000)
        } else {
            if (device.platform == 'browser') {
                // alert('Hej jesteś na przegladarce PC i nie kożystasz z mockowania danych. Dlatego aplikacją Ci świruje :)');
            }

            var ajaxParams = {
                url: app.config.apiHost + '/' + actionName,
                data:  params,
                method: "POST",
                async: true,
                timeout: 3000,
                success: function (data) {
                    if (data) {
                        if (data.isLogged === false) {
                            var user = app.getFromLocalStorage('user');
                            if (user.email && user.password) {
                                login(user.email, user.password, function () {
                                    requestAction(actionName, params, callback)
                                });
                            }
                        }
                        else if (data.error) {
                            app.debugMode.error('WorkeeApi: data.status: ' + data.status, data);
                        }

                        else {
                            if (data.length > 0) {
                                app.setInLocalStorage(actionName, data);
                            }
                            callback && callback(data);
                        }
                    }
                    app.hideLoadingPage();
                },
                error: function (data) {
                    // app.debugMode.error('WorkeeApi: error ' + actionName + ' action', data);
                    app.hideLoadingPage();
                }
            };
            if (params && typeof params.append == "function") {
                ajaxParams.cache = false;
                ajaxParams.processData = false;
                ajaxParams.contentType = false;
            }
            return $.ajax(ajaxParams);
        }
    };

    var getUser = function (id, callback) {
       // app.debugMode.isMock = true
    	if (id) {
			var param = {id : id};
			requestAction('getUser', param, callback);
		} else {
    		app.debugMode.log('WorkeeApi: method getUser require parameters')
		}
		// app.debugMode.isMock = false
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

    var getNews = function (cb) {
	    var actionName = 'getNews';
	    var isDataStorage = fillOutFromStorageData(actionName, cb);
		requestAction(actionName, null,  cb, isDataStorage);
    };

    var setNews = function (params, cb) {
	    var actionName = 'setNews';
		requestAction(actionName, params,  cb);
    };

    var register = function (registerParams, cb){
        requestAction('register', registerParams, cb);
    };

    var editUser = function (registerParams, cb){
        requestAction('edit', registerParams, cb);
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
    	register : register,
    	editUser : editUser,
    	getNews : getNews,
    	setNews : setNews,
	}
}