   var api = {
       
       initialize: function() {
           FB.init({
                    appId: '370557326444175',
                    xfbml: true,
                    version: 'v2.5'
                });
       },
       isConnected: function() {
           FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        console.log('User is: ' + response.status);
                        //FB.logout();
                        checkDisable(false);
                    }
                    else {
                        //fbloginfunc();
                        alert('Please Log In');
                        checkDisable(true);
                    }
                });
       }
   }
   
   
   window.fbAsyncInit = function () {
                
                
            };

            function fbloginfunc() {
                FB.login(function (response) {
                    console.log(response);
                    if (response.status === 'connected') {
                        checkDisable(false);
                    }
                }, {scope: 'publish_actions, manage_pages, publish_pages'});
            }

            function fblogoutfunc() {
                FB.logout();
                checkDisable(true);
            }

            function checkDisable(e) {
                var btns = document.getElementsByClassName('BtnDis');
                for (var i = 0; i < btns.length; i++) {
                    btns[i].disabled = e;
                }
            }

            var pagesIDs = new Array();
            var pagesTokens = new Array();

            // post on users profile
            function fbpost() {
                // for normal statuses or the ones with links (like youtube, GIFs) use me/feed/ and link: 'the link
                // for sharing photos (maybe with text) use me/photos and url: 'the image link'
                FB.api(
                        'me/feed/',
                        'POST',
                        {
                            message: 'Homie PLEASE!',
                            link: 'http://25.media.tumblr.com/08d54accc4beb56a50e752fd931c6b58/tumblr_mlsyqrzwWQ1s3g3ago1_400.gif',
                            // url: 'image link'
                        },
                        function (response) {
                            console.log(response);
                        }
                );
            }

            // get user pages
            function getfromFB() {
                FB.api(
                        'me/accounts?fields=likes,name,talking_about_count,picture,photos,albums,access_token',
                        'GET',
                        function (response) {
                            console.log(response);
                            var parent = document.getElementById('pages');
                            var FBresponse = JSON.parse(JSON.stringify(response.data));
                            var output = '', i;
                            for (i = 0; i < FBresponse.length; i++) {
                                var pname = '<span>Page Name: ' + FBresponse[i].name + ', </span><br>';
                                var pid = '<a target="_blank" href="http://facebook.com/' + FBresponse[i].id + '">See it on Facebook</a><br>';
                                var plikes = '<span>Likes: ' + FBresponse[i].likes + '</span><br>';
                                var ptalking = '<span>Talking About It: ' + FBresponse[i].talking_about_count + '</span><br>';
                                var ppic = '<img src="' + FBresponse[i].picture.data.url + '" /><br>';
                                output += '<p onclick="checkWhichPage(this.id);" id="' + FBresponse[i].id + '">' + pname + pid + plikes + ptalking + ppic + '</p>';
                                pagesIDs[i] = FBresponse[i].id;
                                pagesTokens[i] = FBresponse[i].access_token;
                            }
                            parent.innerHTML = output;
                        }
                );
            }

            var pageID, pageAccessToken;
            function checkWhichPage(e) {
                var i = 0;
                for (i = 0; i < pagesIDs.length; i++) {
                    if (pagesIDs[i] == e) {
                        pageID = pagesIDs[i];
                        pageAccessToken = pagesTokens[i];
                    }
                }
                var btns = document.getElementsByClassName('BtnDis2');
                for (var i = 0; i < btns.length; i++) {
                    btns[i].disabled = false;
                }
            }

            function fbpost2() {
                FB.api(
                        '/' + pageID + '/feed',
                        'POST',
                        {
                            access_token: pageAccessToken,
                            message: "It's awesome ...",
                            link: 'https://www.youtube.com/watch?v=nnD_EMihnCA',
                            name: 'Featured of the Day',
                            to: pageID,
                            from: pageID,
                            description: 'Your description'
                        },
                function (response) {
                    if (!response || response.error) {
                        console.log(response.error);
                    } else {
                        console.log('Post ID: ' + response.id);
                    }
                }
                );
            }

            function getfromFB2() {
                FB.api(
                        pageID + '/posts?fields=message,link,likes,comments,shares',
                        'GET',
                        function (response) {
                            console.log(response);
                            var parent = document.getElementById('pagefeed');
                            var FBresponse = JSON.parse(JSON.stringify(response.data));
                            var output = '', i;
                            for (i = 0; i < FBresponse.length; i++) {
                                if (typeof FBresponse[i].message === 'undefined') {
                                    var pname = '';
                                }
                                else {
                                    var pname = '<span>Message: ' + FBresponse[i].message + '</span><br>';
                                }
                                if (typeof FBresponse[i].link === 'undefined') {
                                    var plink = '';
                                }
                                else {
                                    var plink = '<span> Shared Link: ' + FBresponse[i].link + '</span><br>';
                                }
                                if (typeof FBresponse[i].likes === 'undefined') {
                                    var plikes = '';
                                }
                                else {
                                    var plikes = '<span>Likes: ' + FBresponse[i].likes.data.length + '</span>';
                                }
                                if (typeof FBresponse[i].comments === 'undefined') {
                                    var pcomments = '';
                                }
                                else {
                                    var pcomments = '<span>Comments: ' + FBresponse[i].comments.data.length + '</span>';
                                }
                                if (typeof FBresponse[i].shares === 'undefined') {
                                    var pshares = '';
                                }
                                else {
                                    var pshares = '<span>Shares: ' + FBresponse[i].shares.count + '</span>';
                                }

                                var pitself = '';
                                output += pname + plink + plikes + pcomments + pshares + '<hr><br>';
                            }
                            parent.innerHTML = output;
                        }
                );
            }

            function getimage() {
                FB.api(
                        pageID + '/picture',
                        'GET',
                        function (response) {
                            console.log(response.data.url);
                        }
                );
            }
            
            function getcover() {
                FB.api(
                        pageID + '/albums',
                        'GET',
                        function (response) {
                            console.log(response);
                        }
                );
            }

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
