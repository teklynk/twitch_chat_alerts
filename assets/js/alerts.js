$(document).ready(function () {

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    let botName = getUrlParameter('bot').toLowerCase().trim();
    let channelName = getUrlParameter('channel').toLowerCase().trim();

    if (botName === '') {
        alert('bot is not set in the URL');
    }

    if (channelName === '') {
        alert('channel is not set in the URL');
    }

    let authJson = JSON.parse($.getJSON({'url': "./auth.json", 'async': false}).responseText);

    let jsonData = JSON.parse($.getJSON({'url': "./data.json", 'async': false}).responseText);

    let blockList = JSON.parse($.getJSON({'url': "./block.json", 'async': false}).responseText);

    let notifications = JSON.parse($.getJSON({'url': "./notifications.json", 'async': false}).responseText);

    let blockedUsernames = blockList[0]['usernames'].replace(/\s/g, '');
    blockedUsernames = blockedUsernames.toLowerCase().trim();
    let blockedUsernamesArr = blockedUsernames.split(',');
    blockedUsernamesArr = blockedUsernamesArr.filter(Boolean);
    let authtoken = authJson[0].authtoken;

    // Twitch API: user info: user_id
    function getInfo(channelName, callback) {
        let urlI = "https://twitchapi.teklynk.com/getuserinfo.php?channel=" + channelName + "";
        let xhrI = new XMLHttpRequest();
        xhrI.open("GET", urlI);
        xhrI.onreadystatechange = function () {
            if (xhrI.readyState === 4 && xhrI.status === 200) {
                callback(JSON.parse(xhrI.responseText));
                return true;
            } else {
                return false;
            }
        };

        xhrI.send();
    }

    // Twitch API: recent follow
    let getFollows = function (channelName, callback) {
        let urlF = "https://twitchapi.teklynk.com/getuserfollows.php?channel=" + channelName + "&limit=1";
        let xhrF = new XMLHttpRequest();
        xhrF.open("GET", urlF);
        xhrF.onreadystatechange = function () {
            if (xhrF.readyState === 4) {
                callback(JSON.parse(xhrF.responseText));
                return true;
            } else {
                return false;
            }
        };
        xhrF.send();
    };

    // check for new follows every 30 second
    setInterval(function () {
        // get recent follower
        getFollows(channelName, function (data) {
            let blockedUser = false;
            if (data.data[0]['from_name'] !== localStorage.getItem("followerName")) {
                blockedUsernamesArr.forEach(usersList);

                function usersList(item, index) {
                    if (data.data[0]['from_name'].startsWith(item)) {
                        blockedUser = true;
                    }
                }

                if (!blockedUser) {
                    localStorage.setItem("followerName", data.data[0]['from_name']);
                    getAlert('follow', localStorage.getItem("followerName"), null, null, null, null, null);
                } else {
                    console.log('blocked: ' + data.data[0]['from_name']);
                }
            }
        });
    }, 10000); // every 10 seconds

    // Twitch API get last game played from a user
    let getDetails = function (channelName, callback) {
        let urlG = "https://twitchapi.teklynk.com/getuserstatus.php?channel=" + channelName + "";
        let xhrG = new XMLHttpRequest();
        xhrG.open("GET", urlG);
        xhrG.onreadystatechange = function () {
            if (xhrG.readyState === 4) {
                callback(JSON.parse(xhrG.responseText));
                return true;
            } else {
                return false;
            }
        };
        xhrG.send();
    };

    // Twitch API get clips for !so command
    let getClips = function (channelName, callback) {
        let urlC = "https://twitchapi.teklynk.com/getuserclips.php?channel=" + channelName + "&limit=20";
        let xhrC = new XMLHttpRequest();
        xhrC.open("GET", urlC);
        xhrC.onreadystatechange = function () {
            if (xhrC.readyState === 4) {
                callback(JSON.parse(xhrC.responseText));
                return true;
            } else {
                return false;
            }
        };
        xhrC.send();
    };

    // alerts function pulls from data.json
    function getAlert(alertCommand, username = null, viewers = null, userstate = null, message = null, say = null, months = null) {

        // ignore if already playing an alert
        if ($('.alertItem').length) {
            return false;
        }

        $.each(jsonData, function (idx, obj) {

            if (obj.command === alertCommand) {

                let coolDownExpired;

                let coolDown = parseInt(obj.cooldown);

                let date = new Date();

                if (!localStorage.getItem(alertCommand)) {
                    localStorage.setItem(alertCommand, date.getTime());
                }

                console.log(parseInt(localStorage.getItem(alertCommand)) + coolDown);
                console.log(date.getTime());

                if (date.getTime() > parseInt(localStorage.getItem(alertCommand)) + coolDown) {
                    console.log('cooldown expired');
                    coolDownExpired = true;
                    localStorage.setItem(alertCommand, date.getTime());
                } else {
                    coolDownExpired = false;
                }

                let messageStr;
                let getChannel;
                let blockedUser = false;

                blockedUsernamesArr.forEach(usersList);

                function usersList(item, index) {
                    if (username.startsWith(item)) {
                        blockedUser = true;
                    }
                }

                if (!blockedUser && coolDownExpired === true) {
                    if (obj.perm === "mods" && client.isMod(channelName, username) || username === channelName) {
                        doAlert(); //mods only
                    } else if (obj.perm === "all") {
                        doAlert(); //everyone
                    }
                } else {
                    console.log('blocked: ' + username);
                }

                function doAlert() {

                    if (obj.say) {
                        // Shoutout logic
                        if (alertCommand === '!so') {
                            getChannel = message.substr(4);
                            getChannel = getChannel.replace('@', '');
                            getChannel = getChannel.trim();
                            getChannel = getChannel.toLowerCase();
                                getDetails(getChannel, function (info) {
                                    messageStr = obj.say.replace("{channel}", info.data[0]['broadcaster_name']);
                                    messageStr = messageStr.replace("{playing}", info.data[0]['game_name']);
                                    messageStr = messageStr.replace("{status}", info.data[0]['title']);
                                    messageStr = messageStr.replace("{url}", "https://twitch.tv/" + info.data[0]['broadcaster_login'] + "");
                                    console.log(messageStr);
                                    client.say(channelName, messageStr);
                                });
                        } else {
                            messageStr = obj.say.replace("{username}", username);
                            client.say(channelName, messageStr);
                        }
                    }

                    // on screen alerts
                    console.log(obj.command);
                    console.log(obj.image);
                    console.log(obj.audio);
                    console.log(obj.video);
                    console.log(obj.message);
                    console.log(obj.timelimit);

                    messageStr = obj.message.replace("{username}", "<span class='username'>" + username + "</span>");
                    messageStr = messageStr.replace("{viewers}", "<span class='viewers'>" + viewers + "</span>");
                    messageStr = messageStr.replace("{message}", "<span class='msg'>" + message + "</span>");
                    messageStr = messageStr.replace("{bits}", "<span class='bits'>" + userstate + "</span>");
                    messageStr = messageStr.replace("{months}", "<span class='months'>" + months + "</span>");
                    messageStr = messageStr.replace("{channel}", "<span class='channel'>" + getChannel + "</span>");

                    // remove divs before displaying new alert
                    $("#container .alertItem").remove();

                    $("<div class='alertItem'>").appendTo("#container");

                    if (obj.audio) {
                        let ext = obj.audio.split('.').pop();
                        $("<audio class='sound' preload='auto' src='./media/" + obj.audio + "' autoplay type='audio/" + ext + "'></audio>").appendTo(".alertItem");
                    }
                    if (obj.video) {
                        if (alertCommand === '!so' && obj.video === "{randomclip}") {
                            getChannel = message.substr(4);
                            getChannel = getChannel.replace('@', '');
                            getChannel = getChannel.trim();
                            getChannel = getChannel.toLowerCase();
                                getClips(getChannel, function (info) {
                                    // if clips exist
                                    if (info.data[0]['id']) {
                                        let numOfClips = info.data.length;
                                        let randClip = Math.floor(Math.random() * numOfClips);
                                        let thumbPart = info.data[randClip]['thumbnail_url'].split("-preview-");
                                        thumbPart = thumbPart[0] + ".mp4";
                                        $("<video id='clip' class='video' autoplay src='" + thumbPart + "' type='video/mp4'><source src='" + thumbPart + "' type='video/mp4'></video>").appendTo(".alertItem");
                                    }
                                });
                        } else {
                            let ext = obj.video.split('.').pop();
                            $("<video class='video' autoplay src='./media/" + obj.video + "'><source src='./media/" + obj.video + "' type='video/" + ext + "'></video>").appendTo(".alertItem");
                        }
                    }
                    if (obj.image) {
                        if (obj.image === "{logo}") {
                            if (alertCommand === '!so') {
                                getChannel = message.substr(4);
                                getChannel = getChannel.replace('@', '');
                                getChannel = getChannel.trim();
                                getChannel = getChannel.toLowerCase();
                                username = getChannel;
                            }
                            getInfo(username, function (data) {
                                $("<img class='image logo' src='" + data.data[0]['profile_image_url'] + "'/>").appendTo(".alertItem");
                            });
                        } else {
                            $("<img class='image' src='./media/" + obj.image + "'/>").appendTo(".alertItem");
                        }
                    }
                    if (obj.message) {
                        $("<p class='message'>" + messageStr + "</p>").appendTo(".alertItem");
                    }

                    $("</div>").appendTo("#container");

                    $("#container .alertItem").fadeIn(500).delay(parseInt(obj.timelimit)).fadeOut(500, function () {
                        $(this).remove();
                    });

                }

            }
        });
    }

    const client = new tmi.Client({
        options: {debug: true},
        connection: {reconnect: true},
        identity: {
            username: botName,
            password: 'oauth:' + authtoken
        },
        channels: [channelName]
    });

    client.connect().catch(console.error);

    // triggers on hosted
    client.on("hosted", (channel, username, viewers, autohost) => {
        console.log('hosted: ' + username);
        getAlert('hosted', username, viewers, null, null, null, null);
    });

    // triggers on raid
    client.on("raided", (channel, username, viewers) => {
        console.log('raided: ' + username);
        getAlert('raided', username, viewers, null, null, null, null);
    });

    // triggers on cheer
    client.on("cheer", (channel, userstate, message) => {
        console.log('cheer: ' + userstate.username);
        getAlert('cheer', userstate.username, null, userstate.bits, message, null, null);
    });

    client.on("subscription", (channel, username, method, message, userstate) => {
        console.log('subscription: ' + username);
        getAlert('subscription', username, null, userstate, message, null, null);
    });

    client.on("resub", (channel, username, months, message, userstate, methods) => {
        console.log('resub: ' + username);
        getAlert('resub', username, null, userstate, message, null, months);
    });

    let messageCnt = 0;

    // triggers on message
    client.on('chat', (channel, user, message, self) => {

        // Ignore echoed messages.
        if (self) {
            return false;
        }

        messageCnt++;

        let chatmessage = message.replace(/(<([^>]+)>)/ig, "");

        //alert message
        if (user['message-type'] === 'chat') {
            if (chatmessage.startsWith("!")) {
                //alertCommand, username = null, viewers = null, userstate = null, message = null, say = null, months = null
                getAlert(chatmessage.split(' ')[0], user.username, null, user.state, message, null, null);
            }
        }
    });

    // Random notifications
    // if message count is greater than 30 and 10 minutes has passed, then say a random message in chat
    if (notifications.length > 0) {
        setInterval(function() {
            let randomNotice = notifications[Math.floor(Math.random() * notifications.length)]; // pull random message from array
            if (messageCnt >= 30 && randomNotice.say > "") {
                messageCnt = 0; // reset message count to zero and start over.
                client.say(channelName, randomNotice.say);
            }
        }, 600000); // check every 10 minutes
    }

});