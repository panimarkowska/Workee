if (typeof app == 'undefined') {
	app = {};
}
app.config = {
    apiHost : 'http://workee.mytool.pl'
}

function init() {
    app.showLoadingPage();
    app.setHeaderAndFooter();
    workee = workeeApi();
    app.formsValidation();

	var onDeviceReady = function () {
	    app.menu();
        app.hideLoadingPage();

        $(document).on("pagebeforeshow", function(event) {
	        var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
            if (!app.isLogged() && activePage.attr('id') != "dialogPage"){
                $.mobile.changePage($("#loginPage"));
            }

            var actionMethod = activePage.attr('data-action-method');
            if (actionMethod && app[actionMethod]) {
                app[actionMethod]();
            }
        });

        if (app.isLogged()){
            $.mobile.changePage($("#newsPage"));
        } else {
            $.mobile.changePage($("#loginPage"));
        }
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
        return false;
    }

}

app.login = function (params){
    app.showLoadingPage();
    workee.login(params.email, params.password, function (data) {
        if (data.isLogged){
           workee.getUser(data.isLogged, function (user){
                if (user && user.password) {
                    app.setInLocalStorage('userLogged', data.isLogged);
                    $.mobile.changePage($('#newsPage'));
                    app.setInLocalStorage('user', user);
                }
            });
        }
    });
}

app.register = function (params){
    app.showLoadingPage();
    if ($('#registrationButton').attr('data-status') == 'registration') {
        workee.register(params, function (data) {
            if (data.isRegistered) {
                location.hash = "#newsPage";
            }
            else {
                app.showDialogPage('error', 'ERROR', null, 'Invalid data', 5);
            }
            app.hideLoadingPage();
        });
    }
    else {
        workee.edit(params, function (data) {
            if (data.isRegistered) {
                location.hash = "#newsPage";
            }
            else {
                app.showDialogPage('error', 'ERROR', null, 'Invalid data', 5);
            }
        });
    }
}

app.editPhoto = function (){
    app.showLoadingPage();
    $('#photoVal').on('change', function(){
        var file_data = $(this).prop('files')[0];
        var form_data = new FormData();
        form_data.append('uploads', file_data);
            workee.editUser(form_data, function (data) {
            if (data.photo) {
                $('#myPhoto').attr('src', app.config.apiHost + '/photo/' + data.photo);
            }
            else {
                app.showDialogPage('error', 'ERROR', null, 'Invalid data', 5);
            }
            app.hideLoadingPage();
        });
        $(this).off('change');
        $(this).val('');
    });
    $('#photoVal').click();
}

app.logout = function (){
    app.removeFromLocalStorage();
    // document.cookie = "userLogged=0";
    $.mobile.changePage($('#loginPage'));
}

app.getNews = function (){
    app.showLoadingPage();
    workee.getNews(function (allNews) {
        var htmlList = ''
        for(var i=0; i < allNews.length; i++){
            var news= allNews[i];
            htmlList += '<div class="ui-grid-b">'
                        + '<div class="news">'
                            + '<div class="newsLine">'
                                + '<div class="newsLineSeparator"></div>'
                                + '<div class="newsLinePoint"></div>'
                            + '</div>'
                            + '<div class="newsLineText">'
                                + '<p style="font-weight: bold;margin: 0 0 4px 0;">' + news.title + '</p>'
                                + news.message
                            + '</div>'
                        + '</div>'
                    + '</div>'
        }
        $('#getNewsResult').html('').append(htmlList);
        app.hideLoadingPage();
    });
}

app.getUsers = function (){
    app.showLoadingPage();
    $('#profileEditButton').css({display:'none'});
    workee.getUsers(function (users) {
        var htmlList = ''
        for(var i=0; i < users.length; i++){
            var user = users[i];
            htmlList += '<li><a href="#" onclick="app.getUser(' + user.id + ')">'
                                + '<div class="ui-grid-b">'
                                    + '<div class="ui-block-a" style="width:20%;margin-top: 1%;">'
                                        + '<img style="width:45px; clip-path: circle(50% at 50% 50%);" src="' + (user.photo ?  app.config.apiHost + '/photo/' + user.photo : 'img/user.png') + '"/>'
                                    + '</div>'
                                    + '<div class="ui-block-b" style="width:55%;margin-top: 4%"><p1 style="font-size: 17px;color:#000000;">'
                                            + user.name + ' ' + user.surname
                                    + '</p1></div>'
                                    + '<div class="ui-block-c" style="width:22%;margin-top: 3%;">'
                                        + '<img style="width:27px;float:right" src="img/message.png"/>'
                                    + '</div>'
                                + '</div>'

                + '</a><div style="display:none">' + user.scope + '</div></li>'
        }
        $('#getPeopleResult').html('').append(htmlList).listview( "refresh" );
        app.hideLoadingPage();
    });
}

app.getUser = function (id){
    app.showLoadingPage();
    if (id == app.getFromLocalStorage('userLogged')) {
        $('#profileEditButton').css({display:''});
    }
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
        $('#myPhoto').attr('src', (user.photo ?  (app.config.apiHost + '/photo/' + user.photo) : 'img/user.png'));
        $.mobile.changePage($('#userPage'));
        app.setHeader(user.name + ' '+ user.surname)
        app.hideLoadingPage();
    });

};

app.editUser = function (id){
    app.showLoadingPage();
    workee.getUser(id, function(user) {
        for (var key in user) {
            $('#' + key + 'Value').val(user[key]);
        };
        $('#registrationButton').attr('data-status', 'edit');
        $('#profileEditButton').css({display:''});
        $.mobile.changePage($('#registrationPage'));
        app.setHeader(user.name + ' '+ user.surname)
        app.hideLoadingPage();
    });
};

app.clearRegistration = function () {
    $('#registrationPage').find('input, textarea').val('');
$('#registrationButton').attr('data-status', 'registration');
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
    else if (!key) {
        localStorage.app = '{}';
    }
}