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
videoIdInput.addEventListener("change", e => {
    const url = new URL(e.target.value);
    const videoId = url.searchParams.get("v");

    player.loadVideoById(videoId);
});

/* socket stuff */

const socket = io();
socket.emit("hello", "master");
