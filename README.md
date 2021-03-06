# Twitch alerts overlay

### ** Do not use this on a public server. This is meant to run locally (localhost) or on an internal server (http://localhost/alerts.html...)

Future development can be tracked here: [https://github.com/teklynk/twitch_chat_alerts/projects/1](https://github.com/teklynk/twitch_chat_alerts/projects/1)

## Notes

- Backup your custom css files and custom js files before pulling new changes. You can also diff the files to see what has changed and merge the changes that you want. 
- Rename assets/css/sample.alerts.css to assets/css/alerts.css if the file does not exist.

## Install and Run

- Clone or download this repo.
- Move files to your web server.
- Easiest and prefered method for a simple project like this. 
  - If you have Python installed on your machine, you can run a simple http web server using python. `python3 -m http.server 8000 --bind 127.0.0.1` OR `python2 -m SimpleHTTPServer 8000` (works on Windows, Linux, Mac)
- Set your bot account as a mod on your main channel.
- Rename assets/css/sample.alerts.css to assets/css/alerts.css if the file does not exist.

## Twitch oAuth

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

## URL Parameters

example: http://localhost/twitch_chat_alerts/alerts.html?bot=CoolBot&channel=MrStreamer

- **bot** = Your bot account. This can also be your main account if you do not have a separate bot account.
- **channel** = Your main channel.
- **notify** = true/false. Turn notifications on or off. 

## JSON config files

- Rename **sample.data.json** to **data.json**
- Rename **sample.auth.json** to **auth.json**
- Rename **sample.block.json** to **block.json**
- Rename **sample.notifications.json** to **notifications.json**

Edit **data.json**. Add your own custom !action commands, !so and other bot responses.

**auth.json** contains your Twitch oAuth Token. If you are using a bot account, then you should generate
these token using the bot account and not your main account.

**data.json** contains the alert actions.

**block.json** contains a list of users to block from using alerts.

**notifications.json** is used to send a random chat message on a timed interval (after 10 messages and longer than 10 minutes)

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
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "!fart",
    "image": "",
    "audio": "fart1.mp3",
    "video": "",
    "message": "",
    "say": "{username} just farted :)",
    "timelimit": "1000",
    "perm": "all",
    "cooldown": "10000"
  },
  {
    "command": "!hey,
    "image": "",
    "audio": "",
    "video": "",
    "message": "",
    "say": "hello @{username} :)",
    "timelimit": "1000",
    "perm": "all",
    "cooldown": "10000"
  },
  {
    "command": "!so",
    "image": "",
    "audio": "",
    "video": "{randomclip}",
    "message": "Go check out {channel}",
    "say": "Go check out @{channel}. They were last seen playing: {playing} - {status} {url}",
    "timelimit": "10000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "follow",
    "image": "{logo}",
    "audio": "song2.mp3",
    "message": "Thanks for the follow! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "hosted",
    "image": "{logo}",
    "audio": "song2.mp3",
    "message": "Thanks for the host! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "raided",
    "image": "{logo}",
    "audio": "song2.mp3",
    "message": "Thanks for the raid! {username}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "cheer",
    "image": "{logo}",
    "audio": "",
    "video": "",
    "message": "Thanks for the {bits} cheers! {username} {message}",
    "say": "",
    "timelimit": "8000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "subscription",
    "image": "{logo}",
    "audio": "",
    "video": "",
    "message": "{username} just subscribed",
    "say": "",
    "timelimit": "3000",
    "perm": "mods",
    "cooldown": "10000"
  },
  {
    "command": "resub",
    "image": "{logo}",
    "audio": "",
    "video": "",
    "message": "{username} just resubscribed for {months} months",
    "say": "",
    "timelimit": "3000",
    "perm": "mods",
    "cooldown": "10000"
  }
]
```

- **"command":** Your alert command.
- **"image":** Show image in the overlay
- **"audio":** Plays an audio file
- **"video":** Plays a video file
- **"message":** Displays a message in the overlay
- **"say":** Says a message in chat
- **"timelimit":** (miliseconds) How long the alert runs
- **"perm":** all/mods. Limits the alert to mod only or available to everyone
- **"cooldown":** (miliseconds) Length of time before the command can be used again

### Alert Commands

- **!alert** : Custom chat commands that will trigger when someone in chat uses them (!commands, !sfx, !fart, !so, !
  welcome)
- **!so** : Bot will look up **{channel}** and say a shout-out message with **{playing}**,**{status}**,**{url}**,**{logo}** values for the
  **{channel}** entered. ie: !so teklynk. If **{randomclip}** is set for the video, the alert will play a random clip from the
  channel. If **{logo}** is set, the alert will pull the user logo from Twitch.
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
- **!so** : **{channel}** **{playing}** **{status}** **{url}** **{randomclip}**

### Media Support
Place all media (images, sounds, videos) inside the media folder/directory

- **Video** : webm, ogg, mp4
- **Audio** : mp3, ogg
- **Images** : gif, png, jpg

### Style Sheet

assets/css/alerts.css

Each command is set as a class name on the ".alertItem" div so that you can add custom css for each alert if needed.

Example of how to add custom styling to the command called "hello".

```css
.alertItem.hello p.message {
    text-shadow: 2px 2px #990000;
    font-size: 80px;
}
```
