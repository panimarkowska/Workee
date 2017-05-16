if (typeof app == 'undefined') {
	app = {};
}
function init() {
    app.setHeaderAndFooter();
    workee = workeeApi();
    app.formsValidation();

	var onDeviceReady = function () {
	    app.menu();

        if (app.isLogin()){
            $.mobile.changePage($("#newsPage"));
        } else {
            $.mobile.changePage($("#loginPage"));
        }
	    $(document).on("pagebeforeshow", function(event) {
            if (!app.isLogin()){
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
    $('.formValidation').validate({
        submitHandler: function(formEl) {
            var form = $(formEl)
            var methodName = form.attr('data-method');
            if (methodName && app[methodName]) {
                params = {};
                form.find('input').each(function() {
                    var key = $(this).attr("name")
                    if (key && key != 'submit') {
                        params[key] = $(this).val();
                    }
                });
                app[methodName](params);
            }
        },
        invalidHandler: function(event, validator) {
            console.log('błędny formularz', validator)
        }
    });
}

app.menu = function() {
    var switchMenu = function(swipe){
        var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
        if (activePage.attr('id') == "menuPage" && swipe != "right") {
            $.mobile.back();
            menuIsActive = false;
        } else {
            $.mobile.changePage($("#menuPage"));
        }
    };

    $('.menuButton').click(function(){
        switchMenu();
    });
    $(document).on( "swiperight", function() {
        switchMenu("right");
    });
    $(document).on( "swipeleft", function() {
        $.mobile.back();
    });
}

app.setHeader = function (title) {
    var page = $.mobile.pageContainer.pagecontainer("getActivePage");
    if (page.find('[data-role="header"]').length == 0) {
        var header = $('<div data-role="header" data-position="fixed">');
        page.prepend(header);

        var headerGrid = '<div class="ui-grid-b ui-responsive">' +
	                        '<div class="ui-grid-b">' +
                                '<div class="ui-block-a">' +
                                (page.attr('data-header-menu') == "false" ? '' : '<a href="#menuPage" class="menuButton ui-icon-bars ui-btn-icon-left"</a>')  +
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

app.isLogin = function (){
    var cookies = document.cookie.split("; ");
    for (var i=0; i<cookies.length; i++){
        if (cookies[i].indexOf("userLogged") != -1){
            var userLogged = cookies[i].split("=")[1];
            if (userLogged=="1"){
                return true;
            } else {
                return false;
            }
        } else {
             return false;
        }
    }
    return workee.isLogin();
}

app.login = function (){
    var loginValue = document.getElementById("loginValue").value;
    var passwordValue = document.getElementById("passwordValue").value;

    if (loginValue.length > 0){
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

app.register = function (){
    $("#registrationForm").validate({
        submitHandler: function(form){
                alert("Call login action")
            }
    })
}

app.logout = function (){
    document.cookie = "userLogged=0";
    $.mobile.changePage($('#loginPage'));

}

app.getUsers = function (){
    var users = workee.getUsers();
    var htmlList = ''
    for(var i=0; i < users.length; i++){
        var user = users[i];
        htmlList += '<li><a href="#" onclick="app.getUser(' + user.id + ')">' + user.name + ' ' + user.surname + '</a></li>'
    }
    $('#getPeopleResult').append(htmlList).listview( "refresh" );
}

app.getUser = function (id){
    var user = workee.getUser(id);
    $('#employeeData').append(user.email + ' '+ user.position);
    $.mobile.changePage($('#userPage'));
    app.setHeader(user.name + ' '+ user.surname)

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