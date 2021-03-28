const PS_ENDED = 0;
const PS_PLAYING = 1;
const PS_PAUSED = 2;
const PS_BUFFERING = 3;
const PS_CUED = 5;

/* player init */

let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: "M7lc1UVf-VE",
    });
}

function setVideo(_videoId) {
    videoId = _videoId;
    videoIdInput.value = _videoId;
    player.loadVideoById(_videoId);
}

/* controls */

let videoId;
const videoIdInput = document.getElementById("videoid-input");

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
        player.seekTo(data.currentTime);
    } else if (data.state === PS_PLAYING) {
        console.log("play");
        if (prevState === PS_PAUSED) {
            player.seekTo(data.currentTime);
        }
        player.playVideo();
    } else if (data.state === PS_PAUSED) {
        console.log("pause");
        player.pauseVideo();
    }

    prevState = data.state;
});
