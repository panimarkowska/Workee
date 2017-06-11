if (typeof app == 'undefined') {
	app = {};
}
app.debugMode = (function() {
	var isDebug = true;
	var isMock = false;

	var enableDebug = function (){
		isDebug = true
	}

	var disableDebug = function (){
		isDebug = false
	}

	var getMock = function (name){
		if (dataMock[name]) {
			log('Data mock name: ' + name, dataMock[name]);
			return dataMock[name];
		} else {
			return null;
		}
	}

	var log = function (message, obj){
		if (isDebug) {
			console.log(message + ': ', obj);
		}
	}

	var error = function (message, obj){
		if (isDebug) {
			console.error(message + ': ', obj);
		}
		app.showDialogPage('error', "Error", null, message);
	}

	return {
		isDebug : isDebug,
		isMock : isMock,
		enableDebug : enableDebug,
		disableDebug : disableDebug,
		getMock : getMock,
		log : log,
		error : error
	}
})()