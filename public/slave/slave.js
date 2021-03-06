const LOADED_THRESHOLD = 10_000;

/* controls */

let videoId;
const videoIdInput = document.getElementById("videoid-input");

const videoEl = document.getElementById("video");
const audioEl = document.getElementById("audio");

const mediaEls = [
    // videoEl,
    audioEl,
];

async function setVideo(_videoId) {
    videoId = _videoId;
    videoIdInput.value = _videoId;

    const stream = ss.createStream();

    const parts = [];
    let readBytes = 0;

    ss(socket).emit("getstream", stream, _videoId);
    stream.on("data", chunk => {
        console.log(`read ${chunk.length} bytes of data:`, chunk);
        readBytes += chunk.length;
        parts.push(chunk);
    });
    stream.on("end", () => {
        console.log("stream end");
        mediaSet("src", URL.createObjectURL(new Blob(parts)));
        mediaDo("play");
    });
}

async function mediaDo(fName) {
    return await Promise.all(mediaEls.map(el => el[fName]()));
}

function mediaSet(name, value) {
    mediaSetF(name, () => value);
}

function mediaGet(name) {
    return mediaEls[0][name];
}

function mediaSetF(name, valueFunc) {
    mediaEls.forEach(el => el[name] = valueFunc(el[name]));
}

/* socket stuff */

const socket = io();
socket.emit("hello", "slave");

socket.on("mediacommand", ([command, arg]) => {
    console.log("mediacommand", [command, arg]);

    switch (command) {
        case "videochange":
            setVideo(arg)
            break;
        case "playpause":
            mediaDo(mediaGet("paused") ? "play" : "pause");
            break;
        case "tostart":
            mediaSet("currentTime", 0);
            break;
        case "backward":
            mediaSetF("currentTime", currentTime => currentTime - 10);
            break;
        case "forward":
            mediaSetF("currentTime", currentTime => currentTime + 30);
            break;
        case "volumechange":
            mediaSet("volume", arg / 100);
            break;
    }
});
