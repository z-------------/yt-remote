const Koa = require("koa");
const socket = require("socket.io");
const http = require("http");
const ss = require("socket.io-stream");
const { spawn } = require("child_process");

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

    forward(socket, "mediacommand");

    ss(socket).on("getstream", async (stream, youtubeUrl) => {
        console.log("getstream", youtubeUrl);
        
        const ytdlProc = spawn("youtube-dl", ["-o", "-", `https://www.youtube.com/watch?v=${youtubeUrl}`]);

        ytdlProc.stdout.pipe(stream);

        ytdlProc.stdout.on("end", () => {
            console.log("stdout stream end");
        });
    });
});
