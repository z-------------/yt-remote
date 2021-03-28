const PS_ENDED = 0;
const PS_PLAYING = 1;
const PS_PAUSED = 2;
const PS_BUFFERING = 3;
const PS_CUED = 5;

/* controls */

let videoId;
const videoIdInput = document.getElementById("videoid-input");

const videoEl = document.getElementById("video");
const audioEl = document.getElementById("audio");

async function setVideo(_videoId) {
    videoId = _videoId;
    videoIdInput.value = _videoId;

    const [videoUrl, audioUrl] = await socketAsk("mediaurls", `https://www.youtube.com/watch?v=${_videoId}`);
    console.log({ videoUrl, audioUrl });

    // videoEl.src = videoUrl;
    audioEl.src = audioUrl;
}

function mediaDo(fName) {
    [
        // videoEl,
        audioEl,
    ].forEach(el => el[fName]());
}

function mediaSet(name, value) {
    [
        // videoEl,
        audioEl,
    ].forEach(el => el[name] = value);
}

/* socket stuff */

let prevState = -1;

const socket = io();
socket.emit("hello", "slave");

socket.on("playerevent", data => {
    console.log("playerevent", data);

    if (data.videoId !== videoId) { // video change
        console.log("video change");
        setVideo(data.videoId);
    }

    if (data.state === PS_BUFFERING) { // seek
        console.log("seek");
        mediaSet("currentTime", data.currentTime);
    } else if (data.state === PS_PLAYING) {
        console.log("play");
        if (prevState === PS_PAUSED) {
            mediaSet("currentTime", data.currentTime);
        }
        mediaDo("play");
    } else if (data.state === PS_PAUSED) {
        console.log("pause");
        mediaDo("pause");
    }

    prevState = data.state;
});

socket.on("volumechange", data => {
    mediaSet("volume", data / 100);
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
