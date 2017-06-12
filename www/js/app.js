if (typeof app == 'undefined') {
	app = {};
}
function init() {
    app.setHeaderAndFooter();
    workee = workeeApi();
    app.formsValidation();

	var onDeviceReady = function () {
	    app.menu();

        if (app.isLogged()){
            $.mobile.changePage($("#newsPage"));
        } else {
            $.mobile.changePage($("#loginPage"));
        }
	    $(document).on("pagebeforeshow", function(event) {
	        var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
            if (!app.isLogged() && activePage.attr('id') != "dialogPage"){
                $.mobile.changePage($("#loginPage"));
            }
        });
        $(document).on("pagechange", function(event) {
            var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
            var actionMethod = activePage.attr('data-action-method');
            if (actionMethod && app[actionMethod]) {
                app[actionMethod]();
            }
        });
	}
	document.addEventListener("deviceready",onDeviceReady, false);
}

app.formsValidation = function() {
    $.validator.messages.required = '';
    var forms = $('.formValidation');
    for (var j=0 ; j < forms.length; j++) {
        $(forms[j]).validate({
            submitHandler: function(formEl) {
                var form = $(formEl)
                var methodName = form.attr('data-method');
                if (methodName && app[methodName]) {
                    params = {};
                    form.find('input, textarea').each(function() {
                        var key = $(this).attr("name")
                        if (key && key != 'submit') {
                            params[key] = $(this).val();
                        }
                    });
                    app[methodName](params);
                }
            },
            invalidHandler: function(event, validator) {
                var validMsg = '';
                var i = 0;
                for (var el in validator.invalid) {
                    validMsg += (i == 0 ? '' : ', ') + el;
                    i++;
                }
                // alert(validMsg)
                // app.showDialogPage('warning', null, 'Fill in the field', validMsg, 2);
                console.log('błędny formularz', validator)
            }
        });
    }
}

app.switchMenu = function(swipe){
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
    if (activePage.attr('id') == "menuPage" && typeof swipe == "undefined") {
        $.mobile.back();
    }
    else if (activePage.attr('id') == "menuPage" && swipe == 'left') {
        $.mobile.back();
    }
    else if (activePage.attr('id') != "menuPage" && (typeof swipe == "undefined" || swipe == 'right')) {
        $.mobile.changePage($("#menuPage"));
    }
};

app.menu = function() {
    $(document).on( "swiperight", function() {
        app.switchMenu("right");
    });
    $(document).on( "swipeleft", function() {
        app.switchMenu("left");
    });
};


app.setHeader = function (title) {
    var page = $.mobile.pageContainer.pagecontainer("getActivePage");
    if (page.find('[data-role="header"]').length == 0) {
        var header = $('<div data-role="header" data-position="fixed">');
        page.prepend(header);

        var headerGrid = '<div class="ui-grid-b ui-responsive">' +
	                        '<div class="ui-grid-b">' +
                                '<div class="ui-block-a">' +
                                (page.attr('data-header-menu') == "false" ? '' : '<a href="#menuPage" onclick="app.switchMenu()" class="menuButton ui-icon-bars ui-btn-icon-left"</a>')  +
                                '</div>' +
                                '<div class="ui-block-b">' +
                                    '<p class="headerTitle"></p>' +
                                '</div>' +
                                '<div class="ui-block-c"></div>' +
                            '</div>' +
                        '</div>';
        header.append(headerGrid).trigger("create");
        var headerTitle = title || page.attr('data-header-title');
        if (headerTitle) {
            header.find('.headerTitle').text(headerTitle);
        }
    } else {
        page.find('[data-role="header"] p').text(title);
    }
    $.mobile.resetActivePageHeight();
}
app.setFooter = function (text) {
    var page = $.mobile.pageContainer.pagecontainer("getActivePage");
    var footerText = text ? text : '(c) Workee 2017';
    page.append('<div data-role="footer" data-position="fixed"><h1>' + footerText + '</h1></div>').trigger("create");
    $.mobile.resetActivePageHeight();
}

app.setHeaderAndFooter = function () {
    var page = $.mobile.pageContainer.pagecontainer("getActivePage");
    if (page.find('[data-role="header"]').length == 0) {
        app.setHeader();
        app.setFooter();
    }

    $(document).on( "pagebeforeshow", function() {
        var page = $.mobile.pageContainer.pagecontainer("getActivePage");
        if (page.find('[data-role="header"]').length == 0) {
            app.setHeader();
            app.setFooter();
        }
    });
}

app.isLogged = function (){
    // var cookies = document.cookie.split("; ");
//     for (var i=0; i<cookies.length; i++){
//         if (cookies[i].indexOf("userLogged") != -1){
//             var userLogged = cookies[i].split("=")[1];
//             if (userLogged=="1"){
//                 return true;
//             } else {
//                 return false;
//             }
//         } else {
//              return false;
//         }
//     }
    if (app.getFromLocalStorage('userLogged')) {
        return true
    } else {
        // workee.isLogged(
        //     function(){app.setInLocalStorage('userLogged', true)},
        //     function(){app.setInLocalStorage('userLogged', false)}
        //     );
        return false;

    }

}

app.login = function (){
    var emailValue = document.getElementById("emailValue").value;
    var passwordValue = document.getElementById("passwordValue").value;

    if (emailValue.length > 0){
        if (passwordValue.length>0){
            workee.login(emailValue, passwordValue, function (data) {
                if (data.isLogged){
                app.setInLocalStorage('userLogged', data.isLogged)
                location.hash = "#newsPage";
                }
            });

        }
        else{
            alert("Invalid password.")
        }
    }
    else{
        alert("Invalid login.")
    }
}

app.register = function (params){
    workee.register(params, function(data) {
        if (data.isRegistered){
            location.hash = "#newsPage";
        }
        else{
            app.showDialogPage('error', 'ERROR', null, 'Invalid data', 5);
        }
    });
}

app.logout = function (){
    app.removeFromLocalStorage('userLogged');
    // document.cookie = "userLogged=0";
    $.mobile.changePage($('#loginPage'));

}

app.getUsers = function (){
    workee.getUsers(function (users) {
        var htmlList = ''
        for(var i=0; i < users.length; i++){
            var user = users[i];
            htmlList += '<li><a href="#" onclick="app.getUser(' + user.id + ')">' + user.name + ' ' + user.surname + '</a><div style="display:none">' + user.scope + '</div></li>'
        }
        $('#getPeopleResult').html('').append(htmlList).listview( "refresh" );
    });
}

app.getUser = function (id){
    workee.getUser(id, function(user) {
        $('#nameUser').text("Name: " + user.name);
        $('#surnameUser').text("Surname: " + user.surname);
        $('#positionUser').text("Role: " + user.position);
        $('#phoneUser').text("Phone number: " + user.phone);
        $('#emailUser').text("Email address: " + user.email);
        $('#websiteUser').text("Website: " + user.website);
        $('#scopeUser').text("Daily scope of tasks: " + user.scope);
        $('#deskUser').text("Desk number: " + user.desk);
        $('#birthdayUser').text("Birthday: " + user.birthday);
        $('#interestsUser').text("Hobbies/interests: " + user.interests);

        $.mobile.changePage($('#userPage'));
        app.setHeader(user.name + ' '+ user.surname)
    });


}


app.showLoadingPage = function (msg){
    var loadingEl = $('#loadingPage');
    if (msg) {
        loadingEl.find('p').html(msg);
    } else {
        loadingEl.find('p').html('loading...');
    }
    loadingEl.show();
}

app.hideLoadingPage = function (){
     $('#loadingPage').hide();
}

app.showDialogPage = function (status, headerTitle, bodyTitle, message, time){
        var dialogPage = $('#dialogPage');
        dialogPage.removeClass('success');
        dialogPage.removeClass('warning');
        dialogPage.removeClass('error');
        dialogPage.addClass(status);

        $('#dialogHeaderTitle').text(headerTitle);
        $('#dialogTitle').text(bodyTitle);
        $('#dialogTitle').text(bodyTitle);
        $('#dialogMessage').text(message);


        $.mobile.changePage($("#dialogPage"), {});
        if (time) {
            $('#dialogTimer').text(time + " sec");
            $('#dialogTimer').removeClass();
            $('#dialogTimer').addClass(status);
            timer = 1
            var timerToClose = setInterval(function(){
                $('#dialogTimer').text(time-timer + " sec");
                timer++;
            }, 1000);

            setTimeout(function(){
                clearInterval(timerToClose);
                app.hideDialogPage();
            }, time * 1000);
        } else {
            $('#dialogTimer').text('');
        }
}

app.hideDialogPage = function (){
    $.mobile.back();
}

app.getFromLocalStorage = function (key) {
    var storageParams = {};
    if (localStorage.app) {
        storageParams = JSON.parse(localStorage.app);
    }
    if (key) {
        return storageParams[key];
    } else {
        return storageParams;
    }
}

app.setInLocalStorage = function (key, value) {
    var storageParams = app.getFromLocalStorage();
    storageParams[key] = value;
    localStorage.app = JSON.stringify(storageParams);

}

app.removeFromLocalStorage = function (key) {
    var storageParams = app.getFromLocalStorage();
    if (storageParams[key]) {
        delete storageParams[key];
        localStorage.app = JSON.stringify(storageParams);
    }

}