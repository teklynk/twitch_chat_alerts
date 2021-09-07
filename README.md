# Twitch alerts overlay
### ** Do not use this on a public server. This is meant to run locally (localhost) or on an internal server (http://192.168.xx/alerts.html...)

### URL Parameters
example: http://localhost/twitch_chat_alerts/alerts.html?bot=CoolBot&channel=MrStreamer

 - **bot** = Your bot account. This can also be your main account if you do not have a separate bot account. 
 - **channel** = Your main channel.

### JSON data

 - Rename sample.data.json to data.json
 - Rename sample.auth.json to auth.json

**auth.json** contains your Twitch oAuth Token and Client ID. If you are using a bot account, then you should generate these token using the bot account and not your main account.

**data.json** contains the alert actions. 
```
{
"command": "!alert1",
"image": "alertImage1.png",
"audio": "song1.mp3",
"message": "Hello World! {username}",
"say": "Hello. I am a bot saying things in chat",
"timelimit": "8000"
},
{
"command": "!alert2",
"image": "alertImage2.png",
"audio": "song2.mp3",
"message": "Hello World! {username}",
"say": "Hello. I am a bot saying things in chat",
"timelimit": "8000"
},
{
"command": "follow",
"image": "alertImage2.png",
"audio": "song2.mp3",
"message": "Thanks for the Follow {username}",
"say": "I am being followed",
"timelimit": "8000"
},
```
### Alert Commands
- **!alert** : Custom chat commands that will trigger when someone in chat uses them (!commands, !sfx, !fart, !so, !welcome)
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
 - **{method}**

### Media Support
 - Video : webm
 - Audio : mp3, ogg
 - Images : gif, png, jpeg

### Style Sheet
assets/css/alerts.css

### Install and Run
If you have Python installed on your machine, you can run a simple http web server using python. This project includes a **webserver.py** script.

**Python3:**

python3 -m http.server 8000 --bind 127.0.0.1

**Python2:**

python2 -m SimpleHTTPServer 8000
