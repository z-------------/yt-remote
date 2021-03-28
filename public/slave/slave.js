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

    const [videoUrl, audioUrl] = await socketAsk("mediaurls", `https://www.youtube.com/watch?v=${_videoId}`);
    console.log({ videoUrl, audioUrl });

    // videoEl.src = videoUrl;
    audioEl.src = audioUrl;
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
            mediaSetF("currentTime", currentTime => currentTime + 10);
            break;
        case "volumechange":
            mediaSet("volume", arg / 100);
            break;
    }
});

function socketAsk(questionName, data) {
    return new Promise((resolve, reject) => {
        function cb(answer) {
            socket.offAny(cb);
            resolve(answer);
        }

        socket.on(`answer-${questionName}`, cb);
        socket.emit(`question-${questionName}`, data);
    });
}
