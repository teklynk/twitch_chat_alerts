# Twitch alerts overlay

### ** Do not use this on a public server. This is meant to run locally (localhost) or on an internal server (http://192.168.xx/alerts.html...)

### Twitch oAuth

Tokens can be generated from [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/)

If you want your bot to reply in chat after a command, I suggest creating tokens using your bots account. To do this,
you will need to sign in to Twitch using your bot account before visiting twitchtokengenerator.

Generate a Custom Scope Token with these permissions:

- bits:read
- chat:read
- chat:edit
- channel:read:subscriptions
- channel:read:redemptions
- user:read:subscription
- user:read:follows

### URL Parameters

example: http://localhost/twitch_chat_alerts/alerts.html?bot=CoolBot&channel=MrStreamer

- **bot** = Your bot account. This can also be your main account if you do not have a separate bot account.
- **channel** = Your main channel.

### JSON config files

- Rename sample.data.json to data.json
- Rename sample.auth.json to auth.json
- Rename sample.block.json to block.json
- Rename sample.messages.json to messages.json

Edit **data.json**. Add your own custom !action commands, !so and other bot responses.

**auth.json** contains your Twitch oAuth Token and Client ID. If you are using a bot account, then you should generate
these token using the bot account and not your main account.

**data.json** contains the alert actions.

### Example data.json file with variables
```
[
  {
    "command": "!alert",
    "image": "animatedgif1.gif",
    "audio": "song1.mp3",
    "message": "Hello World1! {username}",
    "say": "",
    "timelimit": "5000",
    "perm": "mods"
  },
  {
    "command": "!fart",
    "image": "",
    "audio": "fart1.mp3",
    "video": "",
    "message": "",
    "say": "{username} just farted :)",
    "timelimit": "1000",
    "perm": "all"
  },
    {
    "command": "!hey,
    "image": "",
    "audio": "",
    "video": "",
    "message": "",
    "say": "hello @{username} :)",
    "timelimit": "1000",
    "perm": "all"
  },
  {
    "command": "!so",
    "image": "",
    "audio": "",
    "video": "{randomvideo}",
    "message": "",
    "say": "Go check out {channel}. They were last seen playing: {playing} - {status} {url}",
    "timelimit": "10000",
    "perm": "mods"
  },
  {
    "command": "follow",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "song2.mp3",
    "message": "Thanks for the follow! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods"
  },
  {
    "command": "hosted",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "song2.mp3",
    "message": "Thanks for the host! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods"
  },
  {
    "command": "raided",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "song2.mp3",
    "message": "Thanks for the raid! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods"
  },
  {
    "command": "cheer",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "",
    "video": "",
    "message": "Thanks for the {bits} cheers! {username} {message}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods"
  },
  {
    "command": "subscription",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "",
    "video": "",
    "message": "{username} just subscribed",
    "say": "",
    "timelimit": "3000",
    "perm": "mods"
  },
  {
    "command": "resub",
    "image": "small-Navy-Blue-Texture-Background.png",
    "audio": "",
    "video": "",
    "message": "{username} just resubscribed for {months} months",
    "say": "",
    "timelimit": "3000",
    "perm": "mods"
  }
]
```

### Alert Commands

- **!alert** : Custom chat commands that will trigger when someone in chat uses them (!commands, !sfx, !fart, !so, !
  welcome)
- **!so** : Bot will look up {channel} and say a shout-out message with {playing},{status},{url} values for the
  {channel} entered. ie: !so teklynk. If {randomvideo} is set for the video, the alert will play a random vod from the
  channel.
- **follow** : This will trigger when you receive a new follower.
- **hosted** : This will trigger when someone hosts your channel.
- **raided** : This will trigger when someone raids your channel.
- **cheer** : This will trigger when you receive a cheer/bits.
- **subscription** : This will trigger when someone subs to your channel.
- **resub** : This will trigger when someone re-subs to you channel.

### Alert Variables

- **{username}**
- **{bits}**
- **{message}**
- **{months}**
- **!so** : **{channel}** **{playing}** **{status}** **{url}** **{randomvideo}**

### Media Support

- **Video** : webm, ogg, mp4 (Linux OBS browser source does not seem to like mp4's)
- **Audio** : mp3, ogg
- **Images** : gif, png, jpg

### Style Sheet

assets/css/alerts.css

### Install and Run

- Setup a simple NGINX web server on your local machine.
- Use XAMPP, WampServer.
- If you have Python installed on your machine, you can run a simple http web server using python. This project includes
  a **webserver.sh** script that will start the python web server.

**Python3:**

python3 -m http.server 8000 --bind 127.0.0.1

**Python2:**

python2 -m SimpleHTTPServer 8000