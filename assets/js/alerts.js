$(document).ready(function () {

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    let botName = getUrlParameter('bot');
    let channelName = getUrlParameter('channel');

    if (botName === '') {
        alert('bot is not set in the URL');
    }

    if (channelName === '') {
        alert('channel is not set in the URL');
    }

    // load and store json data file
    $.getJSON("./data.json", function (json) {
        localStorage.setItem("jsonData", JSON.stringify(json));
    });

    // load and store json data file
    $.getJSON("./auth.json", function (json) {
        localStorage.setItem("alertCreds", JSON.stringify(json));
    });

    // load and store json data file
    $.getJSON("./block.json", function (json) {
        localStorage.setItem("blocks", JSON.stringify(json));
    });

    // get json data from local storage
    let jsonData = localStorage.getItem("jsonData");

    // get auth tokens from local storage. Use tokens from a bot account and not your main channel.
    let authtokens = localStorage.getItem("alertCreds");

    let blockList = localStorage.getItem("blocks");

    if (!jsonData || !authtokens || !blockList) {
        alert('json file not found or set');
    }

    let blockedUsernames;

    $.each($.parseJSON(blockList), function (idx, obj) {
        blockedUsernames = obj.usernames;
    });

    blockedUsernames = blockedUsernames.replace(/\s/g, '');
    blockedUsernames = blockedUsernames.toLowerCase();
    let blockedUsernamesArr = blockedUsernames.split(',');
    blockedUsernamesArr = blockedUsernamesArr.filter(Boolean);

    let authtoken;
    let clientId;

    $.each($.parseJSON(authtokens), function (idx, obj) {
        authtoken = obj.authtoken;
        clientId = obj.clientid;
    });

    // Twitch API: user info: user_id
    function getInfo(channelName, callback) {
        let urlI = "https://api.twitch.tv/helix/users?login=" + channelName + "";
        let xhrI = new XMLHttpRequest();
        xhrI.open("GET", urlI);
        xhrI.setRequestHeader("Authorization", "Bearer " + authtoken + "");
        xhrI.setRequestHeader("Client-Id", clientId);
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

    // get user id and user data on load
    getInfo(channelName, function (data) {
        localStorage.setItem("userId", data.data[0]['id']);
        localStorage.setItem("userName", data.data[0]['display_name']);
        localStorage.setItem("userData", JSON.stringify(data));
    });

    // Twitch API: recent follow
    let getFollows = function (refUserID, callback) {
        let urlF = "https://api.twitch.tv/helix/users/follows?first=1&to_id=" + refUserID + "";
        let xhrF = new XMLHttpRequest();
        xhrF.open("GET", urlF);
        xhrF.setRequestHeader("Authorization", "Bearer " + authtoken + "");
        xhrF.setRequestHeader("Client-Id", clientId);
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

    // check for new follows every 1 second
    setInterval(function () {
        // get recent follower
        getFollows(localStorage.getItem("userId"), function (data) {
            localStorage.setItem("followerId", data.data[0]['from_id']);
            localStorage.setItem("followerData", JSON.stringify(data));
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
                    getAlert('follow', localStorage.getItem("followerName"));
                } else {
                    console.log('blocked: ' + data.data[0]['from_name']);
                }
            }
        });
    }, 1000);

    // Twitch API get last game played from a user
    let getDetails = function (channelID, callback) {
        let urlG = "https://api.twitch.tv/kraken/channels/" + channelID + "";
        let xhrG = new XMLHttpRequest();
        xhrG.open("GET", urlG);
        xhrG.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
        xhrG.setRequestHeader("Client-Id", clientId);
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

    // TODO: add feature that echos a message every x milliseconds or after x number of messages.
    // may need to pull this from a separate json file.
    // add randomize option, every x seconds or every x messages.
    //
    //setInterval( function () {
    //    client.say(channelName,'test');
    //    getAlert(chatmessage, user.username, null, user.state, message, localStorage.getItem("botSay"), null);
    //}, 10000);

    // alerts function pulls from jsonData
    function getAlert(alertCommand, username = null, viewers = null, userstate = null, message = null, say = null, months = null) {
        $.each($.parseJSON(jsonData), function (idx, obj) {
            if (obj.command === alertCommand) {

                let messageStr;
                let getChannel;

                if (obj.say) {
                    // Shoutout logic
                    if (alertCommand === '!so') {
                        getChannel = message.substr(4);
                        getInfo(getChannel, function (data) {
                            getDetails(data.data[0]['id'], function (info) {
                                messageStr = obj.say.replace("{channel}", getChannel.toUpperCase());
                                messageStr = messageStr.replace("{playing}", info['game']);
                                messageStr = messageStr.replace("{status}", info['status']);
                                messageStr = messageStr.replace("{url}", info['url']);
                                console.log(messageStr);
                                client.say(channelName, messageStr);
                            });``
                        });
                    } else {
                        messageStr = obj.say.replace("{username}", username);
                        client.say(channelName, messageStr);
                    }
                }

                // 3 second delay between alerts
                setTimeout(function () {

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

                    //remove divs before displaying new alerts
                    $("#container .alertItem").remove();

                    $("<div class='alertItem'>").appendTo("#container");

                    if (obj.audio) {
                        $("<audio class='sound' preload='auto' src='./media/" + obj.audio + "' autoplay></audio>").appendTo(".alertItem");
                    }
                    if (obj.video) {
                        $("<video class='video' autoplay><source src='./media/" + obj.video + "' type='video/webm'></video>").appendTo(".alertItem");
                    }
                    if (obj.image) {
                        $("<img class='image' src='./media/" + obj.image + "'/>").appendTo(".alertItem");
                    }
                    if (obj.message) {
                        $("<p class='message'>" + messageStr + "</p>").appendTo(".alertItem");
                    }

                    $("</div>").appendTo("#container");

                    $("#container .alertItem").fadeIn(500).delay(parseInt(obj.timelimit)).fadeOut(500, function () {
                        $(this).remove();
                    });

                }, 3000);
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

    // triggers on message
    client.on('message', (channel, user, message, self) => {
        

        let chatmessage = message.replace(/(<([^>]+)>)/ig, "");

        //alert message
        if (user['message-type'] === 'chat') {
            if (chatmessage.startsWith("!")) {
                //alertCommand, username = null, viewers = null, userstate = null, message = null, say = null, months = null
                getAlert(chatmessage.split(' ')[0], user.username, null, user.state, message, null, null);
            }
        }
    });

});