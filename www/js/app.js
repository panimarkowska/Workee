if (typeof app == 'undefined') {
	app = {};
}
function init() {
    app.setHeaderAndFooter();
    workee = workeeApi();

	var onDeviceReady = function onDeviceReady() {
	    // app.menu();
	    var cookies = document.cookie.split("; ");
	    for (var i=0; i<cookies.length; i++){
            if (cookies[i].indexOf("userLogged") != -1){
                var userLogged = cookies[i].split("=")[1];
                if (userLogged=="1"){
                    $.mobile.changePage($("#newsPage"), { transition: 'slidedown' });
                } else {
                    $.mobile.changePage($("#loginPage"), { transition: 'slidedown' });
                }
            } else {
                 $.mobile.changePage($("#loginPage"), { transition: 'slidedown' });
            }
	    }
	    // app.hideLoadingPage();
        // $(document).on( "hashchange", function() {
        //     app.showLoadingPage();
        // });
        // $(document).on( "pageshow", function() {
	     //    app.hideLoadingPage();
        // });
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

app.setHeader = function (title) {
    var page = $.mobile.pageContainer.pagecontainer("getActivePage");
    if (page.find('[data-role="header"]').length == 0) {
        var header = $('<div data-role="header" data-position="fixed">');
        page.prepend(header);

        // header.load("../header.html", function () {
        //     var headerTitle = title || $(this).parent().attr('data-header-title');
        //     if (headerTitle) {
        //         $(this).find('.headerTitle').text(headerTitle);
        //     }
        // });
        var headerGrid = '<div class="ui-grid-b ui-responsive">' +
	                        '<div class="ui-grid-b">' +
                                '<div class="ui-block-a">' +
                                    '<a href="#menuPage" class="ui-icon-bars ui-btn-icon-left menuButton"></a>' +
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