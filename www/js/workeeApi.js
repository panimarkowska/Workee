workeeApi = function () {
    var requestAction = function (actionName, params) {
    	var mockAction = app.debugMode.getMock(actionName);
        if (app.debugMode.isMock && mockAction !== null) {
            return mockAction;
        } else {
            $.ajax({
                url: 'workeeApi.pl',
                data: params ? params : {},
                method: "POST",
                success: function (data) {
                    if (data.status == 'OK') {
                        return data;
                     } else {
                        app.debugMode.error('WorkeeApi: data.status: ' + data.status, data);
                        return null;
                    }
                },
                error: function (data) {
                    app.debugMode.error('WorkeeApi: error ' + actionName + ' action', data)
					return null;
                }
            });
        }
    };

    var getUser = function (id) {
    	if (id) {
			var param = {id : id};
			return requestAction('getUser', param);
		} else {
    		app.debugMode.log('WorkeeApi: method getUser require parameters')
		}
    };

	var getUsers = function () {
		return requestAction('getUsers');
    };

    return {
    	getUser : getUser,
    	getUsers : getUsers,
    	requestAction : requestAction
	}
}