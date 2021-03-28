const Koa = require("koa");
const socket = require("socket.io");
const http = require("http");
const { getUrls } = require("./lib/youtube-dl");

const app = new Koa();

const PORT = 8000;

/* http server */

app.use(require("koa-static")("./public", {}));

const server = http.createServer(app.callback());
const io = socket(server);

server.listen(PORT, () => {
    console.log({ PORT });
});

/* socket stuff */

const sockets = {
    master: null,
    slave: null,
};

function forward(socket, eventName) {
    socket.on(eventName, data => {
        console.log(eventName, data);
        if (socket !== sockets.master) return;

        sockets.slave?.emit(eventName, data);
    });
}

io.on("connection", socket => {
    console.log("connection");

    socket.on("hello", data => {
        console.log("hello", data);
        if (data === "master") {
            sockets.master = socket;
        } else if (data === "slave") {
            sockets.slave = socket;
        }
    });

    forward(socket, "playerevent");
    forward(socket, "volumechange");

    socket.on("question-mediaurls", async youtubeUrl => {
        console.log("question-mediaurls", youtubeUrl);
        socket.emit("answer-mediaurls", await getUrls(youtubeUrl));
    });
});
