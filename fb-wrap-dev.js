/*
 FB-Wrapper
 ------
 Author: Zaid Daba'een
 
 Basic usage:
 
 window.fbAsyncInit = function () {
    fbwrap.initialize();
    fbwrap.isConnected();
    fbwrap.login();
 }
 
 Maximum usage:
 
    window.fbAsyncInit = function () {
        fbwrap.initialize();
        fbwrap.isConnected();
        fbwrap.login(function () {
            fbwrap.getUser(function () {
                fbwrap.getPages(function () {
                    fbwrap.pages[0].albums[0].getPhotos(function () {
                        if(fbwrap.pages[0].albums[0].hasMorePhotos()){
                            fbwrap.pages[0].albums[0].getNextPhotos();
                        }
                    });
                    if(fbwrap.hasMorePages()){
                        fbwrap.getMorePages();
                    }
                });
            });
        });
    };
 
 Change debug variable to disable debug and info logging.
 FBapi imports Facebook SDK, do not import it again.
 Make sure to add an application ID to your settings.
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

var fbwrap = {
    debug: true,
    isLoggedIn: false,
    userID: null,
    user: null,
    pages: null,
    __pages: {next: null, prev: null, more: true}, // Holds pages related information for SDK use
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
                fbwrap.log(response, 'info');
                fbwrap.log("Logged in");
                fbwrap.isLoggedIn = true;
                return true;
            } else {
                fbwrap.log(response, 'error');
                fbwrap.log("Not logged in");
                fbwrap.isLoggedIn = false;
                return false;
            }

            if (callback)
                callback();
        });
    },
    login: function (callback) {
        FB.login(function (response) {
            if (response.status === 'connected') {
                fbwrap.log(response, 'info');
                fbwrap.log("Logged in successfully");
                fbwrap.userID = response.authResponse.userID;
                fbwrap.isLoggedIn = true;
            } else {
                fbwrap.log(response, 'error');
            }

            if (callback)
                callback();
        }, {scope: 'manage_pages, public_profile'});
    },
    logout: function (callback) {
        fbwrap.log("Logged out");
        fbwrap.isLoggedIn = false;
        FB.logout();

        if (callback)
            callback();
    },
    getUser: function (callback) {
        return FB.api(
                'me?fields=picture,name',
                'GET',
                function (response) {
                    fbwrap.log(response, 'info');
                    fbwrap.user = new fbwrap.User(response);

                    if (callback)
                        callback();
                }
        );
    },
    getPages: function (callback, cursor) {
        var query = 'me/accounts?fields=likes,name,talking_about_count,picture,photos,albums,access_token&limit=25'
        
        if(cursor)
            query += "&after=" + cursor;
            
        return FB.api(
                query,
                'GET',
                function (response) {
                    fbwrap.log(response, 'info');
                    fbwrap.pages = [];

                    for (var key in response.data) {
                        fbwrap.pages.push(new fbwrap.Page(response.data[key]));
                    }

                    if (response.paging) {
                        fbwrap.__pages.more = fbwrap.pages.length === 25;
                        fbwrap.__pages.next = response.paging.cursors.after
                        fbwrap.__pages.prev = response.paging.cursors.before
                    }

                    if (callback)
                        callback();
                }
        );
    },
    getNextPages: function (callback) {
        fbwrap.getPages(callback, fbwrap.__pages.next)
    },
    hasMorePages: function (callback) {
        return fbwrap.__pages.more
    },
    setPhotosLimit: function (limit) {
        fbwrap.photos_limit = limit
    },
    log: function (data, type) {
        switch (type) {
            case 'error':
                console.error(data);
                break;
            case 'info':
                if (fbwrap.debug)
                    console.info(data)
                break;
            case 'debug':
            default:
                if (fbwrap.debug)
                    console.log(data);
        }
    },
    Page: function (obj) {

        this.id = obj.id
        this.name = obj.name;
        this.thumb = obj.picture.data.url
        this.albums = [];

        for (var key in obj.albums.data) {
            this.albums.push(new fbwrap.Album(obj.albums.data[key]));
        }

    },
    Album: function (obj) {

        this.id = obj.id
        this.name = obj.name
        this.photos = []
        this.pagination = {next: null, previous: null, more: null}

    },
    Photo: function (obj) {

        this.id = obj.id
        this.name = obj.name
        this.source = obj.source
        this.thumb = obj.picture

    },
    User: function (obj) {

        this.id = obj.id
        this.name = obj.name
        this.picture = obj.picture.data.url

    }
};

fbwrap.Album.prototype.getPhotos = function (callback, cursor) {
    var self = this;

    var query = this.id + '/photos?fields=name,source,picture&limit=' + fbwrap.photos_limit
    if (cursor)
        query += '&after=' + cursor;

    FB.api(query,
            'GET',
            function (response) {
                self.photos = []

                for (var key in response.data) {
                    self.photos.push(new fbwrap.Photo(response.data[key]));
                }

                if (response.paging) {
                    self.pagination.more = self.photos.length === fbwrap.photos_limit;
                    self.pagination.next = response.paging.cursors.after
                    self.pagination.previous = response.paging.cursors.before
                }

                fbwrap.log(response, 'info')

                if (callback)
                    callback()
            }
    );
};

fbwrap.Album.prototype.getNextPhotos = function (callback) {
    this.getPhotos(callback, this.pagination.next);
};

fbwrap.Album.prototype.hasMorePhotos = function () {
    return this.pagination.more;
};

window.fbAsyncInit = function () {
    fbwrap.initialize();
    fbwrap.isConnected();
    fbwrap.login(function () {
        fbwrap.getUser(function () {
            fbwrap.getPages(function () {
                fbwrap.pages[0].albums[0].getPhotos(function () {
                    if(fbwrap.pages[0].albums[0].hasMorePhotos()){
                        fbwrap.pages[0].albums[0].getNextPhotos();
                    }
                });
            });
        });
    });
};