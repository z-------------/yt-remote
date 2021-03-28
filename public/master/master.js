/* controls */

let isPlaying = false;

const videoIdInput = document.getElementById("videoid-input");
const videoIdButton = document.getElementById("videoid-btn");
const volumeInput = document.getElementById("volume-input");
const controlsEl = document.getElementById("controls");

videoIdButton.addEventListener("click", e => {
    const url = new URL(videoIdInput.value);
    const videoId =
        url.hostname === "youtu.be" ? url.pathname.replace(/\//g, "") :
        url.hostname === "www.youtube.com" ? url.searchParams.get("v") :
        null;
    if (videoId === null) {
        return alert("invalid URL");
    }

    socket.emit("mediacommand", ["videochange", videoId]);
});

volumeInput.addEventListener("change", e => {
    socket.emit("mediacommand", ["volumechange", Number(e.target.value)]);
});

controlsEl.addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") return;

    const command = e.target.getAttribute("id").split("-")[1];
    if (command === "playpause") {
        isPlaying = !isPlaying;
        socket.emit("mediacommand", [command, isPlaying]);
    } else {
        socket.emit("mediacommand", [command, null]);
    }
});

/* socket stuff */

const socket = io();
socket.emit("hello", "master");
