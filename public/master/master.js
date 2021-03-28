/* player init */

let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: "M7lc1UVf-VE",
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange,
        },
    });
}

function onPlayerReady(event) {
    // event.target.playVideo();

    player.mute();
}

function onPlayerStateChange(event) {
    console.log("stateChange", event.data);

    socket.emit("playerevent", {
        state: event.data,
        videoId: player.getVideoData()["video_id"],
        currentTime: player.getCurrentTime(),
    });
}

/* controls */

const videoIdInput = document.getElementById("videoid-input");
const videoIdButton = document.getElementById("videoid-btn");
const volumeInput = document.getElementById("volume-input");

videoIdButton.addEventListener("click", e => {
    const url = new URL(videoIdInput.value);
    const videoId =
        url.hostname === "youtu.be" ? url.pathname.replace(/\//g, "") :
        url.hostname === "www.youtube.com" ? url.searchParams.get("v") :
        null;
    if (videoId === null) {
        return alert("invalid URL");
    }

    player.loadVideoById(videoId);
});

volumeInput.addEventListener("change", e => {
    socket.emit("volumechange", Number(e.target.value));
});

/* socket stuff */

const socket = io();
socket.emit("hello", "master");
