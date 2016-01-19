/*
 FBapi
 ------
 Author: Zaid Daba'een
 
 Basic usage:
 
 window.fbAsyncInit = function () {
 fbapi.initialize();
 fbapi.isConnected();
 fbapi.login(function() {
 alert(fbapi.user.name);
 })           
 }
 
 Maximum usage:
 
 window.fbAsyncInit = function () {
 fbapi.initialize();
 fbapi.isConnected();
 fbapi.login(function () {
 fbapi.getPages(function () {
 fbapi.setPhotosLimit(50)
 fbapi.pages[0].albums[0].getPhotos(function (){
 fbapi.pages[0].albums[0].getNextPhotos()
 })
 })
 });
 }
 
 Change debug variable to disable debug and info logging.
 FBapi imports Facebook SDK, do not import it again.
 */


(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "http://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var debug = true;

var fbapi = {
    isLoggedIn: false,
    userID: null,
    user: null,
    pages: null,
    __pages: null,
    photos_limit: 25,
    initialize: function () {
        FB.init({
            appId: '370557326444175',
            xfbml: true,
            version: 'v2.5'
        });
    },
    isConnected: function (callback) {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                fbapi.log(response, 'info');
                fbapi.log("Logged in");
                fbapi.isLoggedIn = true;
                return true;
            } else {
                fbapi.log(response, 'error');
                fbapi.log("Not logged in");
                fbapi.isLoggedIn = false;
                return false;
            }

            if (callback)
                callback();
        });
    },
    login: function (callback) {
        FB.login(function (response) {
            if (response.status === 'connected') {
                fbapi.log(response, 'info');
                fbapi.log("Logged in successfully");
                fbapi.userID = response.authResponse.userID;
                fbapi.isLoggedIn = true;
            } else {
                fbapi.log(response, 'error');
            }

            if (callback)
                callback();
        }, {scope: 'manage_pages, public_profile'});
    },
    logout: function (callback) {
        fbapi.log("Logged out");
        fbapi.isLoggedIn = false;
        FB.logout();

        if (callback)
            callback();
    },
    getUser: function (callback) {
        return FB.api(
                'me?fields=picture,name',
                'GET',
                function (response) {
                    fbapi.log(response, 'info');
                    fbapi.user = new User(response);

                    if (callback)
                        callback();
                }
        );
    },
    getPages: function (callback) {
        return FB.api(
                'me/accounts?fields=likes,name,talking_about_count,picture,photos,albums,access_token',
                'GET',
                function (response) {
                    fbapi.log(response, 'info');
                    fbapi.pages = [];

                    for (var key in response.data) {
                        fbapi.pages.push(new Page(response.data[key]));
                    }

                    fbapi.__pages = response.data

                    if (callback)
                        callback();
                }
        );
    },
    setPhotosLimit: function (limit) {
        fbapi.photos_limit = limit
    },
    log: function (data, type) {
        switch (type) {
            case 'error':
                console.error(data);
                break;
            case 'info':
                if (debug)
                    console.info(data)
                break;
            case 'debug':
            default:
                if (debug)
                    console.log(data);
        }
    }
}

function Page(obj) {

    this.name = obj.name;
    this.thumb = obj.picture.data.url
    this.albums = [];

    for (var key in obj.albums.data) {
        this.albums.push(new Album(obj.albums.data[key]));
    }

}

function Album(obj) {

    this.id = obj.id
    this.name = obj.name
    this.photos = []
    this.next_photos = null
    this.previous_photos = null

}

function Photo(obj) {

    this.id = obj.id
    this.name = obj.name
    this.source = obj.source
    this.thumb = obj.picture

}

Album.prototype.getPhotos = function (callback, cursor) {
    var self = this;

    var query = this.id + '/photos?fields=name,source,picture&limit=' + fbapi.photos_limit
    if (cursor)
        query += '&after=' + cursor

    FB.api(query
            ,
            'GET',
            function (response) {
                self.photos = []

                for (var key in response.data) {
                    self.photos.push(new Photo(response.data[key]));
                }

                if (response.paging) {
                    self.next_photos = response.paging.cursors.after
                    self.previous_photos = response.paging.cursors.before
                }

                fbapi.log(response, 'info')

                if (callback)
                    callback()
            }
    );
}

function User(obj) {

    this.id = obj.id
    this.name = obj.name
    this.picture = obj.picture.data.url

}

Album.prototype.getNextPhotos = function (callback) {
    this.getPhotos(callback, this.next_photos)
}

window.fbAsyncInit = function () {
    fbapi.initialize();
    fbapi.isConnected();
    fbapi.login(function () {
        fbapi.getUser(function () {
            fbapi.getPages(function () {
                fbapi.pages[0].albums[0].getPhotos(function () {
                    fbapi.pages[0].albums[0].getNextPhotos()
                })
            })
        })
    });
}