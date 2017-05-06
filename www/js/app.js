if (typeof app == 'undefined') {
	app = {};
}
function init() {
    app.setHeaderAndFooter();
    workee = workeeApi();

	var onDeviceReady = function onDeviceReady() {
	    app.menu();

	    var cookies = document.cookie.split("; ");
	    for (var i=0; i<cookies.length; i++){
            if (cookies[i].indexOf("userLogged") != -1){
                var userLogged = cookies[i].split("=")[1];
                if (userLogged=="1"){
                    $.mobile.changePage($("#newsPage"), { transition: 'slidedown' });
                } else {
                    $.mobile.changePage($("#loginPage"), { transition: 'slidedown' });
                }
            }
	    }
        $(document).on( "hashchange", function() {
            app.showLoadingPage();
        });
	    $(document).on( "pageshow", function() {
	        app.hideLoadingPage();
        });
	}
	document.addEventListener("deviceready",onDeviceReady, false);
}

app.menu = function() {
    var menuIsActive = false;
    var switchMenu = function(){
        if (menuIsActive) {
            $.mobile.back();
            menuIsActive = false;
        } else {
            menuIsActive = true;

        }
    };

    $('.menuButton').click(function(){
        switchMenu();
    });
    $(document).on( "swiperight", function() {
        switchMenu();
    });
    $(document).on( "pagechange", function() {
            if (location.hash != '#menuPage') {
                $('.menu').find('.ui-btn-active').removeClass('ui-btn-active');
                $('.menu').find('a[href="' + location.hash + '"]').addClass('ui-btn-active');
            }
    });


}

app.setHeaderAndFooter = function () {
    // $('<div data-role="header"></div>').prependTo('[data-role="page"]');
    // $('<div data-role="footer" data-position="fixed"></div>').appendTo('[data-role="page"]');

    $('[data-role="header"]').load("../header.html", function(){
        console.log(this)
        var headerTitle = $(this).parent().attr('data-header-title');
        if (headerTitle) {
            $(this).find('.headerTitle').text(headerTitle);
        }

    });
    $('<h1>(c) Workee 2017</h1>').appendTo($('[data-role="footer"]'));
    $.mobile.changePage($(location.hash));
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

app.logout = function (){
    document.cookie = "userLogged=0";
    $.mobile.changePage($('#loginPage'), {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: false
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