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
    let srcSet = false;

    function startMedia() {
        // videoEl.src = URL.createObjectURL(new Blob(parts));
        // videoEl.play();

        mediaSet("src", URL.createObjectURL(new Blob(parts)));
        mediaDo("play");
    }

    ss(socket).emit("getstream", stream, _videoId);
    stream.on("data", chunk => {
        console.log(`read ${chunk.length} bytes of data:`, chunk);
        readBytes += chunk.length;
        parts.push(chunk);

        if (!srcSet && readBytes >= 10_000) {
            console.log(`We have ${readBytes} bytes of data, set src and start playing.`);
            srcSet = true;
            startMedia();
        }
    });
    stream.on("end", () => {
        console.log("stream end");
        startMedia();
    });
}

function mediaDo(fName) {
    mediaEls.forEach(el => el[fName]());
}

function mediaSet(name, value) {
    mediaSetF(name, () => value);
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
            mediaDo(arg ? "play" : "pause");
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
