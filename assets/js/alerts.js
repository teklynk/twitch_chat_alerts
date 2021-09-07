$(document).ready(function () {

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    let botName = getUrlParameter('bot');
    let channelName = getUrlParameter('channel');

    // load and store json data file
    $.getJSON("./data.json", function (json) {
        localStorage.setItem("jsonData", JSON.stringify(json));
    });

    // load and store json data file
    $.getJSON("./auth.json", function (json) {
        localStorage.setItem("alertCreds", JSON.stringify(json));
    });

    // get json data from local storage
    let jsonData = localStorage.getItem("jsonData");

    // get auth tokens from local storage. Use tokens from a bot account and not your main channel.
    let authtokens = localStorage.getItem("alertCreds");
    let authtoken;
    let clientId;
    $.each($.parseJSON(authtokens), function (idx, obj) {
        authtoken = obj.authtoken;
        clientId = obj.clientid;
    });

    // Twitch API: user info: user_id
    let getInfo = function (channelName) {
        let urlU = "https://api.twitch.tv/helix/users?login=" + channelName + "";
        let xhrU = new XMLHttpRequest();
        xhrU.open("GET", urlU);
        xhrU.setRequestHeader("Authorization", "Bearer " + authtoken + "");
        xhrU.setRequestHeader("Client-Id", clientId);
        xhrU.onreadystatechange = function () {
            if (xhrU.readyState === 4) {
                let dataU = JSON.parse(xhrU.responseText);
                let userId = `${dataU.data[0]['id']}`;
                localStorage.setItem("userId", userId);
                return userId;
            } else {
                return false;
            }

        };
        xhrU.send();
    };

    // Twitch API: recent follow
    let getFollows = function () {
        let urlF = "https://api.twitch.tv/helix/users/follows?first=1&to_id=" + localStorage.getItem("userId") + "";
        let xhrF = new XMLHttpRequest();
        xhrF.open("GET", urlF);
        xhrF.setRequestHeader("Authorization", "Bearer " + authtoken + "");
        xhrF.setRequestHeader("Client-Id", clientId);
        xhrF.onreadystatechange = function () {
            if (xhrF.readyState === 4) {
                let dataF = JSON.parse(xhrF.responseText);
                let follows = `${dataF.data[0]['from_name']}`;
                //let follows = 'test';

                if (follows !== localStorage.getItem("recentFollower")) {
                    localStorage.setItem("recentFollower", follows);
                    getAlert('follow', localStorage.getItem("recentFollower"));
                }

                return follows;
            } else {
                return false;
            }
        };
        xhrF.send();
    };

    // alerts function pulls from jsonData
    function getAlert(alertCommand, username = null, viewers = null, userstate = null, message = null, say = null, method = null) {
        $.each($.parseJSON(jsonData), function (idx, obj) {
            if (obj.command === alertCommand) {

                console.log(obj.command);
                console.log(obj.image);
                console.log(obj.audio);
                console.log(obj.video);
                console.log(obj.message);
                console.log(obj.say);
                console.log(obj.timelimit);

                let messageStr;

                if (username) {
                    messageStr = obj.message.replace("{username}", "<span class='username'>" + username + "</span>");
                    messageStr = messageStr.replace("{viewers}", "<span class='viewers'>" + viewers + "</span>");
                    messageStr = messageStr.replace("{message}", "<span class='msg'>" + message + "</span>");
                    messageStr = messageStr.replace("{bits}", "<span class='bits'>" + userstate + "</span>");
                    messageStr = messageStr.replace("{method}", "<span class='method'>" + method + "</span>");
                }

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
                if (obj.say) {
                    localStorage.setItem("botSay", obj.say);
                }

                $("</div>").appendTo("#container");

                $("#container .alertItem").fadeIn(1000).delay(obj.timelimit).fadeOut(1000, function () {
                    $(this).remove();
                });
            }
        });
    }

    // call functions
    getInfo(channelName);

    // check for new follows every 5 seconds
    setInterval(function () {
        getFollows();
    }, 5000);

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
        if (self) return;
        //console.log('hosted: ' + username);
        getAlert('hosted', username, viewers, null, null, null , null);
    });

    // triggers on raid
    client.on("raided", (channel, username, viewers) => {
        if (self) return;
        //console.log('raided: ' + username);
        getAlert('raided', username, viewers, null, null, null, null);
    });

    // triggers on cheer
    client.on("cheer", (channel, userstate, message) => {
        if (self) return;
        //console.log('cheer: ' + userstate.username);
        getAlert('cheer', userstate.username, null, userstate.bits, message, null, null);
    });

    client.on("subscription", (channel, username, method, message, userstate) => {
        if (self) return;
        //console.log('subscription: ' + username);
        getAlert('subscription', username, null, userstate, message, null, method);
    });

    client.on("resub", (channel, username, months, message, userstate, methods) => {
        if (self) return;
        //console.log('resub: ' + username);
        getAlert('resub', username, null, userstate, message, null, methods);
    });

    // triggers on message
    client.on('message', (channel, user, message, self) => {

        if (self) return;

        let chatmessage = message.replace(/(<([^>]+)>)/ig, "");

        // Ignore echoed messages.
        if (self) return;

        //alert message
        if (user['message-type'] === 'chat') {
            //console.log(user.username);
            if (chatmessage.startsWith("!")) {

                getAlert(chatmessage.split(' ')[0], user.username, null);

                if (localStorage.getItem("botSay")) {
                    client.say(channel, user.username + " " + localStorage.getItem("botSay"));
                    localStorage.setItem("botSay", "");
                }

            }
        }

    });

});