# Description
The project is a small side-project for working with streams and web scraping.
It uses yt-dlp and yt-search to auto sync a youtube playlist between the clients phone and the server (server.mjs)

## Usage
```bash
## Server side
node server.mjs

## Client side
node main.mjs files
## files specifies the folder from the root directory from where it will place the downloads
```

The project is runnable in a Termux environment on Android and any Web host that can hosts nodeJS servers (Render)

## Other
You may need to pass in your youtube cookies as the server file uses it. If you do not want to,
```js
// Line 11, server.mjs
// Remove --cookies cookie.txt from here
 const params = `-f bestaudio[ext=m4a]/91/92 -v -x --audio-format m4a --audio-quality 0 --cookies cookies.txt --no-keep-video --js-runtimes node -o ${outputBase} ${videoUrl}`;
```

### Downloading process
Code first checks if the no of files in the downloads folder is same as the no of songs in playlist
If not, it finds and downloads the non-existence ones by:
1. Using yt-search package for their name and videoIDs
2. Downloading them and saving them at a temporary file for cleanups
3. Using blobs and nodeJS streams to efficiently transfer into client sides
4. Client side uses ```fs.createWriteStream``` to convert the blob to a file
5. Cleans up if any error occurs and deletes the temporary file

Uses express, yt-search, ffmpeg (File conversion and Audio extraction), yt-dlp
